import { BrokerTopic } from '../../config/broker/BrokerTopic';
import { Observable } from 'rxjs';

export interface MessageBrokerMessage<T> {
  message: T;
  replayTo?: string;
}

export interface MessageBroker {
  publish<T>(topic: BrokerTopic | string, message?: T, replayTo?: string): Observable<void>;

  subscribe<T>(topic: BrokerTopic | string): Observable<MessageBrokerMessage<T>>;

  unsubscribe(topic: BrokerTopic | string): void;

  requestOnce<T, R>(topic: BrokerTopic | string, message?: T): Observable<R>;
}
