import { MessageBroker, MessageBrokerToken } from '../port/MessageBroker';
import { BrokerTopic } from '../../config/broker/BrokerTopic';
import { Service } from 'typedi';
import { Observable, of } from 'rxjs';

@Service(MessageBrokerToken)
export class KafkaBrokerAdapter implements MessageBroker {
  public publish<T>(
    topic: BrokerTopic | string,
    message?: T,
    replayTo?: string
  ): Observable<void> {
    // todo: tbi
    return of();
  }

  public requestOnce<T, R>(
    topic: BrokerTopic | string,
    message?: T
  ): Observable<R> {
    // todo: tbi
    return of();
  }

  public subscribe<T>(topic: BrokerTopic | string): Observable<T> {
    // todo: tbi
    return of();
  }

  public unsubscribe(topic: BrokerTopic | string): void {
    // todo: tbi
  }
}
