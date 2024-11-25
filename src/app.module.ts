import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ConfigModule} from '@nestjs/config';
import {validationSchemaConfig} from './common/config/validation.config';
import {getEnvPath} from './common/config/env-path.config';
import {KafkaModule} from './kafka/kafka.module';

@Module({
  imports: [
    KafkaModule,
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
