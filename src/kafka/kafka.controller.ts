import {Controller} from '@nestjs/common';
import {MessagePattern, Payload} from '@nestjs/microservices';

@Controller()
export class KafkaController {
  @MessagePattern('hero.kill.dragon')
  async handleMessage(@Payload() message: object): Promise<void> {
    try {
      console.log('Received message:', message);
      throw new Error('Kafka error');
    } catch (e) {
      console.log('Error:', e);
    }
  }
}
