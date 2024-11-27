import {Module} from '@nestjs/common';
import {ClientsModule} from '@nestjs/microservices';
import {KafkaProducerService} from './kafka-producer.service';
import {ConfigService} from '@nestjs/config';
import {getKafkaProducerConfig} from '../config/kafka.config';

/**
 * Kafka 프로듀서 모듈
 *
 * Kafka 프로듀서를 위한 설정과 서비스를 제공합니다.
 */
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_PRODUCER',
        useFactory: async (configService: ConfigService) =>
          getKafkaProducerConfig(configService),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [KafkaProducerService],
  exports: [KafkaProducerService],
})
export class KafkaProducerModule {}
