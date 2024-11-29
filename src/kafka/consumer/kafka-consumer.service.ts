import {Injectable, Logger} from '@nestjs/common';
import {UserRegistrationMessage} from '../../users/interfaces/user-registration-message.interface';
import {UserRegistrationDto} from '../../users/dto/user-registration.dto';
import {transformAndValidate} from '../../common/utils/validation.util';
import {UserService} from '../../users/user.service';

/**
 * Kafka 컨슈머 서비스
 *
 * Kafka 컨슈머 관련 로직을 처리하는 서비스입니다.
 */
@Injectable()
export class KafkaConsumerService {
  private readonly logger = new Logger(KafkaConsumerService.name);

  constructor(private readonly userService: UserService) {}

  async processUserRegistrationEvent(message: UserRegistrationMessage) {
    const userRegistrationDto: UserRegistrationDto = await transformAndValidate(
      UserRegistrationDto,
      message,
    );

    await this.userService.signUp(userRegistrationDto);

    this.logger.log(
      `Received user registration: ${JSON.stringify(userRegistrationDto)}`,
    );
  }
}
