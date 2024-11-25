import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {MicroserviceOptions, Transport} from '@nestjs/microservices';

/**
 * 애플리케이션을 초기화하고 서버를 시작합니다.
 * @return {Promise<void>} 비동기 부트스트랩 함수입니다.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'], // Kafka 브로커 주소
      },
      consumer: {
        groupId: 'my-kafka-consumer', // 고유한 Consumer 그룹 ID 설정
      },
    },
  });

  await app.startAllMicroservices();
}

bootstrap();
