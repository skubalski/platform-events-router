import { BrokerTopic } from '../../config/broker/BrokerTopic';

export interface MessageBrokerMessage {}

type SubscriptionCallback<T extends MessageBrokerMessage> = (message: T) => Promise<void>;

export interface MessageBroker {
  connect(): Promise<void>;

  publish<T extends MessageBrokerMessage>(topic: BrokerTopic, message: T): Promise<void>;

  subscribe<T extends MessageBrokerMessage>(topic: BrokerTopic, cb: SubscriptionCallback<T>): void;
}
