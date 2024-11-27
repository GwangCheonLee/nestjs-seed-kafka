import {Injectable, Logger} from '@nestjs/common';
import {HttpService} from '@nestjs/axios';
import {ConfigService} from '@nestjs/config';
import {catchError, firstValueFrom} from 'rxjs';
import {KafkaMessageContext} from '../interfaces/kafka-message-context.interface';
import {KafkaProducerService} from '../producer/kafka-producer.service';

/**
 * Kafka 페일오버 서비스
 *
 * 메시지 처리 실패 시 페일오버 로직을 처리합니다.
 */
@Injectable()
export class KafkaFailoverService {
  private readonly logger = new Logger(KafkaFailoverService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly kafkaProducerService: KafkaProducerService,
  ) {}

  /**
   * Dead Letter Queue로 실패한 메시지를 전송합니다.
   *
   * @param {KafkaMessageContext} context - Kafka 메시지 컨텍스트
   */
  async sendToDeadLetterQueue(context: KafkaMessageContext): Promise<void> {
    const deadLetterTopic = `${context.topic}.deadletter`;

    try {
      this.logger.warn(
        `Failover triggered: Topic "${context.topic}", Partition ${context.partition}, Offset ${context.offset}. Sending to Dead Letter Queue.`,
      );
      await this.kafkaProducerService.sendMessage(deadLetterTopic, {
        originalTopic: context.topic,
        partition: context.partition,
        offset: context.offset,
        failedMessage: context.message,
        errorMessage: context.error?.message,
        errorStack: context.error?.stack,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(
        `Message successfully sent to Dead Letter Queue: ${deadLetterTopic}.`,
      );
    } catch (sendError) {
      this.logger.error(
        `Failed to send message to Dead Letter Queue: ${deadLetterTopic}`,
        sendError.stack,
      );
    }
  }

  /**
   * 웹훅을 통해 메시지 처리 실패를 알립니다.
   *
   * @param {KafkaMessageContext} context - Kafka 메시지 컨텍스트
   */
  async notifyFailureViaWebhook(context: KafkaMessageContext): Promise<void> {
    const webhookEnabled = this.configService.get<boolean>(
      'KAFKA_FAILOVER_WEBHOOK_ENABLED',
    );

    const webhookUrl = this.configService.get<string>(
      'KAFKA_FAILOVER_WEBHOOK_URL',
    );

    if (!webhookEnabled || !webhookUrl) {
      this.logger.warn('Webhook notification is disabled or URL is not set.');
      return;
    }

    const payload = {
      text: `
**Kafka Message Processing Failed**

- **Original Topic**: ${context.topic}
- **Partition**: ${context.partition}
- **Offset**: ${context.offset}
- **Error Message**: ${context.error?.message}
- **Timestamp**: ${new Date().toISOString()}

- **Failed Message**:
\`\`\`json
${JSON.stringify(context.message, null, 2)}
\`\`\`
`,
    };

    try {
      await firstValueFrom(
        this.httpService.post(webhookUrl, payload).pipe(
          catchError((err) => {
            this.logger.error(
              'Failed to send failure notification via webhook',
              err.stack,
            );
            throw err;
          }),
        ),
      );
      this.logger.log('Failure notification sent via webhook.');
    } catch (err) {
      this.logger.error(
        'Error occurred while sending webhook notification.',
        err.message,
      );
    }
  }

  /**
   * 메시지 처리 실패 시 페일오버 처리를 수행합니다.
   *
   * @param {KafkaMessageContext} context - Kafka 메시지 컨텍스트
   */
  async handleConsumingFailover(context: KafkaMessageContext): Promise<void> {
    await this.sendToDeadLetterQueue(context);
    await this.notifyFailureViaWebhook(context);
  }
}
