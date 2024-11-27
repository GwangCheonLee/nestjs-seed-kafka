import {Inject, Injectable, Logger, OnModuleInit} from '@nestjs/common';
import {ClientKafka} from '@nestjs/microservices';
import {firstValueFrom} from 'rxjs';

/**
 * Kafka 프로듀서 서비스
 *
 * 메시지를 Kafka 토픽으로 발송하는 기능을 제공합니다.
 */
@Injectable()
export class KafkaProducerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaProducerService.name);

  constructor(
    @Inject('KAFKA_PRODUCER') private readonly kafkaClient: ClientKafka,
  ) {}

  /** 모듈 초기화 시 Kafka 클라이언트와 연결합니다. */
  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  /**
   * Kafka 메시지 발송 메서드
   *
   * @param {string} topic 메시지를 발송할 Kafka 토픽
   * @param {object} message 발송할 메시지 데이터
   */
  async sendMessage(topic: string, message: object): Promise<void> {
    try {
      await firstValueFrom(this.kafkaClient.emit(topic, message));
      this.logger.log(`Message sent to topic ${topic}`);
    } catch (error) {
      this.logger.error(
        `Failed to send message to topic ${topic}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
