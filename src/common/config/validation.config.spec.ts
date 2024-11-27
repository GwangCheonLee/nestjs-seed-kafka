// Sample DTO for testing
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
      REDIS_HOST: 'localhost',
      REDIS_PORT: 6379,
      JWT_ACCESS_TOKEN_SECRET: 'secret',
      JWT_ACCESS_TOKEN_EXPIRATION_TIME: 3600,
      JWT_REFRESH_TOKEN_SECRET: 'secret',
      JWT_REFRESH_TOKEN_EXPIRATION_TIME: 86400,
      GOOGLE_AUTH_CLIENT_ID: 'clientId',
      GOOGLE_AUTH_CLIENT_SECRET: 'clientSecret',
      GOOGLE_AUTH_CALLBACK_URL: 'http://localhost/callback',
      GOOGLE_AUTH_BASE_REDIRECT_URL: 'http://localhost',
      TWO_FACTOR_AUTHENTICATION_APP_NAME: 'MyApp',
    });

    expect(result.error).toBeUndefined();
    expect(result.value.TZ).toBe('UTC');
    expect(result.value.SERVER_PORT).toBe(3000);
    expect(result.value.API_PREFIX).toBe('api');
    expect(result.value.LIMIT_CONCURRENT_LOGIN).toBe(false);
  });

  it('should throw an error if required fields are missing', () => {
    const {error} = schema.validate({});

    expect(error).toBeDefined();
    expect(error!.details[0].message).toContain('"DB_HOST" is required');
  });

  it('should not return errors for optional fields when they are missing', () => {
    const result = schema.validate({
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_NAME: 'testdb',
      DB_USER_NAME: 'user',
      DB_USER_PASSWORD: 'password',
      REDIS_HOST: 'localhost',
      REDIS_PORT: 6379,
      JWT_ACCESS_TOKEN_SECRET: 'secret',
      JWT_ACCESS_TOKEN_EXPIRATION_TIME: 3600,
      JWT_REFRESH_TOKEN_SECRET: 'secret',
      JWT_REFRESH_TOKEN_EXPIRATION_TIME: 86400,
      GOOGLE_AUTH_CLIENT_ID: 'clientId',
      GOOGLE_AUTH_CLIENT_SECRET: 'clientSecret',
      GOOGLE_AUTH_CALLBACK_URL: 'http://localhost/callback',
      GOOGLE_AUTH_BASE_REDIRECT_URL: 'http://localhost',
      TWO_FACTOR_AUTHENTICATION_APP_NAME: 'MyApp',
    });

    expect(result.error).toBeUndefined();
  });
});
