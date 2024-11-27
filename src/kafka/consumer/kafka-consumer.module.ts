import {Module} from '@nestjs/common';
import {KafkaConsumerController} from './kafka-consumer.controller';
import {KafkaConsumerService} from './kafka-consumer.service';
import {KafkaProducerModule} from '../producer/kafka-producer.module';
import {KafkaFailoverModule} from '../failover/kafka-failover.module';

/**
 * Kafka 컨슈머 모듈
 *
 * Kafka 컨슈머의 컨트롤러와 서비스를 제공하는 모듈입니다.
 */
@Module({
  imports: [KafkaProducerModule, KafkaFailoverModule],
  controllers: [KafkaConsumerController],
  providers: [KafkaConsumerService],
})
export class KafkaConsumerModule {}
