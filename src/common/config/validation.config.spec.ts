import * as Joi from 'joi';
import {validationSchemaConfig} from './validation.config';

describe('Joi Validation Schema Configuration', () => {
  let schema: Joi.ObjectSchema;

  beforeEach(() => {
    schema = validationSchemaConfig();
  });

  it('should validate environment variables and set default values for optional fields', () => {
    const result = schema.validate({
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_NAME: 'testdb',
      DB_USER_NAME: 'user',
      DB_USER_PASSWORD: 'password',
      JWT_ACCESS_TOKEN_SECRET: 'mySecret',
      JWT_ACCESS_TOKEN_EXPIRATION_TIME: 3600,
      KAFKA_BROKERS: 'localhost:9092',
      KAFKA_CONSUMER_GROUP_ID: 'test-group',
    });

    expect(result.error).toBeUndefined();
    expect(result.value.TZ).toBe('UTC');
    expect(result.value.SERVER_PORT).toBe(3000);
    expect(result.value.KAFKA_AUTO_COMMIT).toBe(false);
    expect(result.value.KAFKA_ALLOW_AUTO_TOPIC_CREATION).toBe(false);
  });

  it('should throw an error if required fields are missing', () => {
    const {error} = schema.validate({
      DB_HOST: 'localhost',
      DB_PORT: '5432',
    });

    expect(error).toBeDefined();
    expect(error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining('"DB_NAME" is required'),
        }),
      ]),
    );
  });

  it('should validate conditional fields when KAFKA_FAILOVER_WEBHOOK_ENABLED is true', () => {
    const {error, value} = schema.validate({
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_NAME: 'testdb',
      DB_USER_NAME: 'user',
      DB_USER_PASSWORD: 'password',
      JWT_ACCESS_TOKEN_SECRET: 'mySecret',
      JWT_ACCESS_TOKEN_EXPIRATION_TIME: 3600,
      KAFKA_BROKERS: 'localhost:9092',
      KAFKA_CONSUMER_GROUP_ID: 'test-group',
      KAFKA_FAILOVER_WEBHOOK_ENABLED: true,
      KAFKA_FAILOVER_WEBHOOK_URL: 'http://example.com/webhook',
    });

    expect(error).toBeUndefined();
    expect(value.KAFKA_FAILOVER_WEBHOOK_ENABLED).toBe(true);
    expect(value.KAFKA_FAILOVER_WEBHOOK_URL).toBe('http://example.com/webhook');
  });

  it('should throw an error when KAFKA_FAILOVER_WEBHOOK_ENABLED is true but URL is missing', () => {
    const {error} = schema.validate({
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_NAME: 'testdb',
      DB_USER_NAME: 'user',
      DB_USER_PASSWORD: 'password',
      JWT_ACCESS_TOKEN_SECRET: 'mySecret',
      JWT_ACCESS_TOKEN_EXPIRATION_TIME: 3600,
      KAFKA_BROKERS: 'localhost:9092',
      KAFKA_CONSUMER_GROUP_ID: 'test-group',
      KAFKA_FAILOVER_WEBHOOK_ENABLED: true,
    });

    expect(error).toBeDefined();
    expect(error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining(
            '"KAFKA_FAILOVER_WEBHOOK_URL" is required',
          ),
        }),
      ]),
    );
  });

  it('should not throw an error when optional fields are missing', () => {
    const {error, value} = schema.validate({
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_NAME: 'testdb',
      DB_USER_NAME: 'user',
      DB_USER_PASSWORD: 'password',
      JWT_ACCESS_TOKEN_SECRET: 'mySecret',
      JWT_ACCESS_TOKEN_EXPIRATION_TIME: 3600,
      KAFKA_BROKERS: 'localhost:9092',
      KAFKA_CONSUMER_GROUP_ID: 'test-group',
    });

    expect(error).toBeUndefined();
    expect(value.TZ).toBe('UTC');
    expect(value.SERVER_PORT).toBe(3000);
  });
});
