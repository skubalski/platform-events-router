import { Service } from 'typedi';
import { Observable, of } from 'rxjs';
import { MessageBrokerMessage } from '../../../../infrastructure/port/MessageBroker';
import { RouterConfigChanges } from '../../message/broker/RouterConfigChanges';
import { RouterConfig } from '../entity/RouterConfig';
import { mergeMap, switchMap } from 'rxjs/operators';

@Service()
export class ObservableUtility {
  public flagMessages(observable: Observable<MessageBrokerMessage<RouterConfigChanges>>): Observable<RouterConfig> {
    return observable.pipe(
      mergeMap(message => message.message.configs)
    );
  }

  public empty<T>(observable: Observable<T>): Observable<void> {
    return observable.pipe(
      switchMap(() => of<void>())
    );
  }
}
