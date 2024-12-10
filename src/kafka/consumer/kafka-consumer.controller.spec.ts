import {Test, TestingModule} from '@nestjs/testing';
import {KafkaConsumerController} from './kafka-consumer.controller';
import {KafkaConsumerService} from './kafka-consumer.service';
import {KafkaFailoverService} from '../failover/kafka-failover.service';
import {KafkaContext} from '@nestjs/microservices';
import {UserRegistrationMessage} from '../../users/interfaces/user-registration-message.interface';
import {KafkaMessageContext} from '../interfaces/kafka-message-context.interface';

const mockKafkaConsumerService = {
  processUserRegistrationEvent: jest.fn(),
};

const mockKafkaFailoverService = {
  handleConsumingFailover: jest.fn(),
};

describe('KafkaConsumerController', () => {
  let controller: KafkaConsumerController;
  let kafkaConsumerService: KafkaConsumerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KafkaConsumerController],
      providers: [
        {provide: KafkaConsumerService, useValue: mockKafkaConsumerService},
        {provide: KafkaFailoverService, useValue: mockKafkaFailoverService},
      ],
    }).compile();

    controller = module.get<KafkaConsumerController>(KafkaConsumerController);
    kafkaConsumerService =
      module.get<KafkaConsumerService>(KafkaConsumerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleUserRegistration', () => {
    it('should process a user registration event successfully', async () => {
      const message: UserRegistrationMessage = {
        email: 'test@example.com',
        nickname: 'testuser',
      };

      const kafkaContext = {
        getMessage: jest.fn().mockReturnValue({offset: '123'}),
        getPartition: jest.fn().mockReturnValue(0),
        getTopic: jest.fn().mockReturnValue('user.registration.event'),
        getConsumer: jest.fn().mockReturnValue({
          commitOffsets: jest.fn().mockResolvedValue(undefined),
        }),
      } as unknown as KafkaContext;

      await controller.handleUserRegistration(message, kafkaContext);

      expect(
        kafkaConsumerService.processUserRegistrationEvent,
      ).toHaveBeenCalledWith(message);
      expect(kafkaContext.getConsumer().commitOffsets).toHaveBeenCalledWith([
        {
          topic: 'user.registration.event',
          partition: 0,
          offset: '124',
        },
      ]);
    });

    it('should handle errors and call failover service', async () => {
      const message: UserRegistrationMessage = {
        email: 'test@example.com',
        nickname: 'testuser',
      };

      const kafkaContext = {
        getMessage: jest.fn().mockReturnValue({offset: '123'}),
        getPartition: jest.fn().mockReturnValue(0),
        getTopic: jest.fn().mockReturnValue('user.registration.event'),
        getConsumer: jest.fn().mockReturnValue({
          commitOffsets: jest.fn().mockResolvedValue(undefined),
        }),
      } as unknown as KafkaContext;

      const error = new Error('Processing error');
      mockKafkaConsumerService.processUserRegistrationEvent.mockRejectedValueOnce(
        error,
      );

      await controller.handleUserRegistration(message, kafkaContext);

      const messageContext: KafkaMessageContext = {
        topic: 'user.registration.event',
        partition: 0,
        offset: '123',
        message,
        error,
      };

      expect(
        mockKafkaFailoverService.handleConsumingFailover,
      ).toHaveBeenCalledWith(messageContext);
    });
  });
});
