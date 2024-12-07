import {Test, TestingModule} from '@nestjs/testing';
import {KafkaProducerService} from './kafka-producer.service';
import {Logger} from '@nestjs/common';
import {of} from 'rxjs';

describe('KafkaProducerService', () => {
  let service: KafkaProducerService;
  const mockKafkaClient = {
    connect: jest.fn(),
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KafkaProducerService,
        {
          provide: 'KAFKA_PRODUCER',
          useValue: mockKafkaClient,
        },
      ],
    }).compile();

    service = module.get<KafkaProducerService>(KafkaProducerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should connect to Kafka client on module initialization', async () => {
    await service.onModuleInit();
    expect(mockKafkaClient.connect).toHaveBeenCalledTimes(1);
  });

  it('should send message to the specified topic', async () => {
    const topic = 'test-topic';
    const message = {key: 'value'};
    mockKafkaClient.emit.mockReturnValueOnce(of(null));

    await service.sendMessage(topic, message);

    expect(mockKafkaClient.emit).toHaveBeenCalledWith(topic, message);
    expect(mockKafkaClient.emit).toHaveBeenCalledTimes(1);
  });

  it('should log error and throw when message sending fails', async () => {
    const topic = 'test-topic';
    const message = {key: 'value'};
    const error = new Error('Kafka emit failed');
    mockKafkaClient.emit.mockReturnValueOnce(of(Promise.reject(error)));

    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    await expect(service.sendMessage(topic, message)).rejects.toThrow(error);

    expect(Logger.prototype.error).toHaveBeenCalledWith(
      `Failed to send message to topic ${topic}: ${error.message}`,
      error.stack,
    );
  });
});
