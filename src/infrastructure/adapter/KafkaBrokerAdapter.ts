import 'reflect-metadata';
import { MessageBroker, MessageBrokerMessage, SubscriptionCallback } from '../port/MessageBroker';
import { BrokerTopic } from '../../config/broker/BrokerTopic';
import { Service } from 'typedi';

@Service()
export class KafkaBrokerAdapter implements MessageBroker {
  public subscribe<T extends MessageBrokerMessage>(
    topic: BrokerTopic,
    cb: SubscriptionCallback<T>,
    replayTo?: string
  ): void {
    // todo: tbi
  }

  public async requestOnce<T extends MessageBrokerMessage, R extends MessageBrokerMessage>(
    topic: BrokerTopic | string,
    message?: T
  ): Promise<R> {
    // todo: tbi
    return <R> {};
  }

  public unsubscribe(topic: BrokerTopic | string): void {
    // todo: tbi
  }

  public async publish<T extends MessageBrokerMessage>(
    topic: BrokerTopic | string,
    message?: T,
    replayTo?: string
  ): Promise<void> {
    // todo: tbi
  }
}
