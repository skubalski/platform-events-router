import { DatabaseTopic } from '../../config/database/DatabaseTopic';

export interface DatabaseListenerMessage {}

type SubscriptionCallback<T extends DatabaseListenerMessage> = (message: T) => Promise<void>;

export interface DatabaseListener {
  connect(): Promise<void>;

  subscribe<T extends DatabaseListenerMessage>(topic: DatabaseTopic, callback: SubscriptionCallback<T>): void;

  publish<T extends DatabaseListenerMessage>(topic: DatabaseTopic, message: T): Promise<void>;
}
