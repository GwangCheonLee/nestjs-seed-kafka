import {Controller, Logger} from '@nestjs/common';
import {
  Ctx,
  KafkaContext,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import {KafkaMessageContext} from '../interfaces/kafka-message-context.interface';
import {KafkaFailoverService} from '../failover/kafka-failover.service';
import {UserRegistrationMessage} from '../../users/interfaces/user-registration-message.interface';
import {KafkaConsumerService} from './kafka-consumer.service';

/**
 * Kafka 컨슈머 컨트롤러
 *
 * Kafka 메시지를 수신하고 처리하는 컨트롤러입니다.
 */
@Controller()
export class KafkaConsumerController {
  private readonly logger = new Logger(KafkaConsumerController.name);

  constructor(
    private readonly kafkaConsumerService: KafkaConsumerService,
    private readonly kafkaFailoverService: KafkaFailoverService,
  ) {}

  /**
   * 'user.registration.event' 토픽에서 메시지를 처리합니다.
   *
   * @param {UserRegistrationMessage} message 수신된 메시지 본문
   * @param {KafkaContext} context Kafka 메시지 컨텍스트
   */
  @MessagePattern('user.registration.event')
  async handleUserRegistration(
    @Payload() message: UserRegistrationMessage,
    @Ctx() context: KafkaContext,
  ) {
    const {offset} = context.getMessage();
    const partition = context.getPartition();
    const topic = context.getTopic();
    const consumer = context.getConsumer();

    try {
      this.logger.log(
        `Received user registration: ${JSON.stringify(message)} of topic ${topic}`,
      );

      await this.kafkaConsumerService.processUserRegistrationEvent(message);

      await consumer.commitOffsets([
        {topic, partition, offset: (BigInt(offset) + 1n).toString()},
      ]);

      console.log('commit offset');
      console.log({topic, partition, offset});

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
