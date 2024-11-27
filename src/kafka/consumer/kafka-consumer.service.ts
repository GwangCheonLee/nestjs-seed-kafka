import {Injectable, Logger} from '@nestjs/common';

/**
 * Kafka 컨슈머 서비스
 *
 * Kafka 컨슈머 관련 로직을 처리하는 서비스입니다.
 */
@Injectable()
export class KafkaConsumerService {
  private readonly logger = new Logger(KafkaConsumerService.name);

  constructor() {}
}
