import { BrokerTopic } from '../../config/broker/BrokerTopic';

export interface MessageBrokerMessage {}

export type SubscriptionCallback<T extends MessageBrokerMessage> = (message: T, replayTo?: string) => Promise<void>;

export interface MessageBroker {
  connect(): Promise<void>;

  publish<T extends MessageBrokerMessage>(topic: BrokerTopic | string, message?: T, replayTo?: string): Promise<void>;

  subscribe<T extends MessageBrokerMessage>(topic: BrokerTopic | string, cb: SubscriptionCallback<T>): void;
}
