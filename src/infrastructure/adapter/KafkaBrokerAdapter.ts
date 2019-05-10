import 'reflect-metadata';
import { MessageBroker, MessageBrokerMessage, SubscriptionCallback } from '../port/MessageBroker';
import { BrokerTopic } from '../../config/broker/BrokerTopic';
import { Service } from 'typedi';

@Service()
export class KafkaBrokerAdapter implements MessageBroker {
  public async connect(): Promise<void> {
    // todo: tbi
  }

  public async publish<T extends MessageBrokerMessage>(
    topic: BrokerTopic,
    message: T,
    replayTo?: string
  ): Promise<void> {
    // todo: tbi
  }

  public subscribe<T extends MessageBrokerMessage>(
    topic: BrokerTopic,
    cb: SubscriptionCallback<T>,
    replayTo?: string
  ): void {
    // todo: tbi
  }
}
