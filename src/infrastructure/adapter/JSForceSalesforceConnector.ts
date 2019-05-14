import { SalesforceConnector } from '../port/SalesforceConnector';
import { Observable, of } from 'rxjs';
import { Service } from 'typedi';

@Service()
export class JSForceSalesforceConnector implements SalesforceConnector {
  public subscribe<T>(topic: string): Observable<T> {
    // todo: tbi
    return of();
  }

  public unsubscribe(topic: string): Observable<void> {
    // todo: tbi
    return of();
  }
}
