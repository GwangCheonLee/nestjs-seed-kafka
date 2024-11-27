import {Controller, Logger} from '@nestjs/common';
import {
  Ctx,
  KafkaContext,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import {KafkaMessageContext} from '../interfaces/kafka-message-context.interface';
import {KafkaFailoverService} from '../failover/kafka-failover.service';

/**
 * Kafka 컨슈머 컨트롤러
 *
 * Kafka 메시지를 수신하고 처리하는 컨트롤러입니다.
 */
@Controller()
export class KafkaConsumerController {
  private readonly logger = new Logger(KafkaConsumerController.name);

  constructor(private readonly kafkaFailoverService: KafkaFailoverService) {}

  /**
   * 'user.registration.event' 토픽에서 메시지를 처리합니다.
   *
   * @param {object} message 수신된 메시지 본문
   * @param {KafkaContext} context Kafka 메시지 컨텍스트
   */
  @MessagePattern('user.registration.event')
  async handleUserRegistration(
    @Payload() message: object,
    @Ctx() context: KafkaContext,
  ) {
    const consumer = context.getConsumer();
    const topic = context.getTopic();
    const {offset} = context.getMessage();
    const partition = context.getPartition();

    try {
      this.logger.log(`Received user registration: ${JSON.stringify(message)}`);

      await consumer.commitOffsets([{topic, partition, offset}]);
      this.logger.log(
        `Successfully processed message at offset ${offset} in partition ${partition} of topic ${topic}`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing user registration at offset ${offset} in partition ${partition} of topic ${topic}: ${error.message}`,
        error.stack,
      );

      const messageContext: KafkaMessageContext = {
        topic,
        partition,
        offset,
        message,
        error,
      };

      await this.kafkaFailoverService.handleConsumingFailover(messageContext);
    }
  }
}
