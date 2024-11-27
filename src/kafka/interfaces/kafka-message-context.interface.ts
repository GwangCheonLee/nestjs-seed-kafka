export interface KafkaMessageContext {
  topic: string;
  partition: number;
  offset: string;
  message: object;
  error?: Error;
}
