import {Module} from '@nestjs/common';
import {HttpModule} from '@nestjs/axios';
import {KafkaFailoverService} from './kafka-failover.service';
import {KafkaProducerModule} from '../producer/kafka-producer.module'; // 추가

/**
 * Kafka 페일오버 모듈
 *
 * 메시지 처리 실패 시 페일오버 처리를 위한 설정과 서비스를 제공합니다.
 */
@Module({
  imports: [HttpModule, KafkaProducerModule],
  providers: [KafkaFailoverService],
  exports: [KafkaFailoverService],
})
export class KafkaFailoverModule {}
