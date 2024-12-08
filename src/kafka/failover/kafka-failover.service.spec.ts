import {Test, TestingModule} from '@nestjs/testing';
import {KafkaFailoverService} from './kafka-failover.service';
import {HttpService} from '@nestjs/axios';
import {ConfigService} from '@nestjs/config';
import {KafkaProducerService} from '../producer/kafka-producer.service';
import {of, throwError} from 'rxjs';

const mockHttpService = {
  post: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

const mockKafkaProducerService = {
  sendMessage: jest.fn(),
};

describe('KafkaFailoverService', () => {
  let service: KafkaFailoverService;
  let httpService: HttpService;
  let configService: ConfigService;
  let kafkaProducerService: KafkaProducerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KafkaFailoverService,
        {provide: HttpService, useValue: mockHttpService},
        {provide: ConfigService, useValue: mockConfigService},
        {provide: KafkaProducerService, useValue: mockKafkaProducerService},
      ],
    }).compile();

    service = module.get<KafkaFailoverService>(KafkaFailoverService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
    kafkaProducerService =
      module.get<KafkaProducerService>(KafkaProducerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendToDeadLetterQueue', () => {
    it('should send a message to the dead letter queue successfully', async () => {
      const context = {
        topic: 'test-topic',
        partition: 0,
        offset: '123',
        message: {key: 'value'},
        error: new Error('Test error'),
      };
      mockKafkaProducerService.sendMessage.mockResolvedValueOnce(undefined);

      await service.sendToDeadLetterQueue(context);

      expect(mockKafkaProducerService.sendMessage).toHaveBeenCalledWith(
        'test-topic.deadletter',
        expect.objectContaining({
          originalTopic: 'test-topic',
          partition: 0,
          offset: '123',
          failedMessage: {key: 'value'},
          errorMessage: 'Test error',
        }),
      );
    });

    it('should log an error if sending to the dead letter queue fails', async () => {
      const context = {
        topic: 'test-topic',
        partition: 0,
        offset: '123',
        message: {key: 'value'},
        error: new Error('Test error'),
      };
      const error = new Error('Send error');
      mockKafkaProducerService.sendMessage.mockRejectedValueOnce(error);

      await service.sendToDeadLetterQueue(context);

      expect(mockKafkaProducerService.sendMessage).toHaveBeenCalled();
    });
  });

  describe('notifyFailureViaWebhook', () => {
    it('should send a failure notification via webhook', async () => {
      const context = {
        topic: 'test-topic',
        partition: 0,
        offset: '123',
        message: {key: 'value'},
        error: new Error('Test error'),
      };
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'KAFKA_FAILOVER_WEBHOOK_ENABLED') return true;
        if (key === 'KAFKA_FAILOVER_WEBHOOK_URL')
          return 'http://example.com/webhook';
      });
      mockHttpService.post.mockReturnValueOnce(of({data: 'success'}));

      await service.notifyFailureViaWebhook(context);

      expect(httpService.post).toHaveBeenCalledWith(
        'http://example.com/webhook',
        expect.objectContaining({
          text: expect.stringContaining('Kafka Message Processing Failed'),
        }),
      );
    });

    it('should log a warning if webhook notification is disabled or URL is missing', async () => {
      mockConfigService.get.mockReturnValueOnce(false);

      const context = {
        topic: 'test-topic',
        partition: 0,
        offset: '123',
        message: {key: 'value'},
        error: new Error('Test error'),
      };

      await service.notifyFailureViaWebhook(context);

      expect(httpService.post).not.toHaveBeenCalled();
    });

    it('should log an error if sending the webhook notification fails', async () => {
      const context = {
        topic: 'test-topic',
        partition: 0,
        offset: '123',
        message: {key: 'value'},
        error: new Error('Test error'),
      };
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'KAFKA_FAILOVER_WEBHOOK_ENABLED') return true;
        if (key === 'KAFKA_FAILOVER_WEBHOOK_URL')
          return 'http://example.com/webhook';
      });
      mockHttpService.post.mockReturnValueOnce(
        throwError(() => new Error('Webhook error')),
      );

      await service.notifyFailureViaWebhook(context);

      expect(httpService.post).toHaveBeenCalled();
    });
  });

  describe('handleConsumingFailover', () => {
    it('should call both sendToDeadLetterQueue and notifyFailureViaWebhook', async () => {
      const context = {
        topic: 'test-topic',
        partition: 0,
        offset: '123',
        message: {key: 'value'},
        error: new Error('Test error'),
      };
      jest.spyOn(service, 'sendToDeadLetterQueue').mockResolvedValueOnce();
      jest.spyOn(service, 'notifyFailureViaWebhook').mockResolvedValueOnce();

      await service.handleConsumingFailover(context);

      expect(service.sendToDeadLetterQueue).toHaveBeenCalledWith(context);
      expect(service.notifyFailureViaWebhook).toHaveBeenCalledWith(context);
    });
  });
});
