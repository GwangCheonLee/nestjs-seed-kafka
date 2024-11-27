import {
  ClientProvider,
  MicroserviceOptions,
  Transport,
} from '@nestjs/microservices';
import {ConfigService} from '@nestjs/config';
import {Partitioners} from 'kafkajs';

/**
 * Kafka 컨슈머 설정을 반환합니다.
 *
 * @param {ConfigService} configService 설정 서비스 인스턴스
 * @return {MicroserviceOptions} Kafka 마이크로서비스 옵션 객체
 */
export function getKafkaConsumerConfig(
  configService: ConfigService,
): MicroserviceOptions {
  const kafkaAutoCommit = configService.get<boolean>('KAFKA_AUTO_COMMIT');
  const kafkaBrokers = configService.get<string>('KAFKA_BROKERS').split(',');
  const kafkaConsumerGroupId = configService.get<string>(
    'KAFKA_CONSUMER_GROUP_ID',
  );

  return {
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: kafkaBrokers,
      },
      consumer: {
        groupId: kafkaConsumerGroupId,
      },
      run: {
        autoCommit: kafkaAutoCommit,
      },
    },
  };
}

/**
 * Kafka 프로듀서 설정을 반환합니다.
 *
 * @param {ConfigService} configService - ConfigService 인스턴스
 * @return {ClientProvider} Kafka 클라이언트 설정
 */
export function getKafkaProducerConfig(
  configService: ConfigService,
): ClientProvider {
  return {
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: configService.get<string>('KAFKA_BROKERS').split(','),
      },
      producer: {
        allowAutoTopicCreation: configService.get<boolean>(
          'KAFKA_ALLOW_AUTO_TOPIC_CREATION',
          true,
        ),
        createPartitioner: Partitioners.DefaultPartitioner,
      },
    },
  };
}
