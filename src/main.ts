// main.ts

import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ConfigService} from '@nestjs/config';
import {getKafkaConsumerConfig} from './kafka/config/kafka.config';

/**
 * 애플리케이션을 초기화하고 서버를 시작합니다.
 * @return {Promise<void>} 비동기 부트스트랩 함수입니다.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const kafkaConsumerConfig = getKafkaConsumerConfig(configService);

  app.connectMicroservice(kafkaConsumerConfig);

  await app.startAllMicroservices();
  const serverPort: number = configService.get<number>('SERVER_PORT') || 3000;
  await app.listen(serverPort);
}

bootstrap();
