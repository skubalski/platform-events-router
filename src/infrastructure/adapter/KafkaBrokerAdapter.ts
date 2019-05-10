import { MessageBroker, MessageBrokerMessage } from '../port/MessageBroker';
import { BrokerTopic } from '../../config/broker/BrokerTopic';

export class KafkaBrokerAdapter implements MessageBroker {
  public async connect(): Promise<void> {
    // todo: tbi
  }

  public async publish<T extends MessageBrokerMessage>(topic: BrokerTopic, message: T): Promise<void> {
    // todo: tbi
  }

  public subscribe<T extends MessageBrokerMessage>(topic: BrokerTopic, cb: (message: T) => Promise<void>): void {
    // todo: tbi
  }
}
