import {ConfigService} from '@nestjs/config';
import {Transport} from '@nestjs/microservices';
import {getKafkaConsumerConfig, getKafkaProducerConfig} from './kafka.config';

describe('Kafka Config Functions', () => {
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    configService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;
  });

  describe('getKafkaConsumerConfig', () => {
    it('should return the correct Kafka consumer configuration', () => {
      configService.get.mockImplementation((key: string) => {
        const mockConfig = {
          KAFKA_AUTO_COMMIT: true,
          KAFKA_BROKERS: 'broker1,broker2',
          KAFKA_CONSUMER_GROUP_ID: 'test-group',
        };
        return mockConfig[key];
      });

      const result = getKafkaConsumerConfig(configService);

      expect(result).toEqual({
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: ['broker1', 'broker2'],
          },
          consumer: {
            groupId: 'test-group',
          },
          run: {
            autoCommit: true,
          },
        },
      });
      expect(configService.get).toHaveBeenCalledWith('KAFKA_AUTO_COMMIT');
      expect(configService.get).toHaveBeenCalledWith('KAFKA_BROKERS');
      expect(configService.get).toHaveBeenCalledWith('KAFKA_CONSUMER_GROUP_ID');
    });
  });

  describe('getKafkaProducerConfig', () => {
    it('should return the correct Kafka producer configuration', () => {
      configService.get.mockImplementation((key: string) => {
        const mockConfig = {
          KAFKA_BROKERS: 'broker1,broker2',
          KAFKA_ALLOW_AUTO_TOPIC_CREATION: true,
        };
        return mockConfig[key];
      });

      const result = getKafkaProducerConfig(configService);

      expect(result).toEqual({
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: ['broker1', 'broker2'],
          },
          producer: {
            allowAutoTopicCreation: true,
            createPartitioner: expect.any(Function),
          },
        },
      });
      expect(configService.get).toHaveBeenCalledWith('KAFKA_BROKERS');
      expect(configService.get).toHaveBeenCalledWith(
        'KAFKA_ALLOW_AUTO_TOPIC_CREATION',
        true,
      );
    });
  });
});
