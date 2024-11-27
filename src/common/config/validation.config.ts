import * as Joi from 'joi';

/**
 * Defines a Joi validation schema for environment variables
 * @return {Joi.ObjectSchema} Joi object schema for env variables
 */
export const validationSchemaConfig = (): Joi.ObjectSchema => {
  return Joi.object({
    TZ: Joi.string().default('UTC'),
    SERVER_PORT: Joi.number().default(3000),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.string().required(),
    DB_NAME: Joi.string().required(),
    DB_USER_NAME: Joi.string().required(),
    DB_USER_PASSWORD: Joi.string().required(),
    JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
    JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.number().required(),
    KAFKA_BROKERS: Joi.string().required(),
    KAFKA_CONSUMER_GROUP_ID: Joi.string().required(),
    KAFKA_AUTO_COMMIT: Joi.boolean().default(false),
    KAFKA_ALLOW_AUTO_TOPIC_CREATION: Joi.boolean().default(false),
    KAFKA_FAILOVER_WEBHOOK_ENABLED: Joi.boolean().default(false),
    KAFKA_FAILOVER_WEBHOOK_URL: Joi.string()
      .uri()
      .when('KAFKA_FAILOVER_WEBHOOK_ENABLED', {
        is: true,
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
  });
};
