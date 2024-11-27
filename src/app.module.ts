import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ConfigModule} from '@nestjs/config';
import {validationSchemaConfig} from './common/config/validation.config';
import {getEnvPath} from './common/config/env-path.config';
import {KafkaConsumerModule} from './kafka/consumer/kafka-consumer.module';
import {KafkaProducerModule} from './kafka/producer/kafka-producer.module';

@Module({
  imports: [
    KafkaProducerModule,
    KafkaConsumerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvPath(),
      validationSchema: validationSchemaConfig(),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
