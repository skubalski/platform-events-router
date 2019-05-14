import { Observable } from 'rxjs';

export interface SalesforceConnector {
  subscribe<T>(topic: string): Observable<T>;

  unsubscribe(topic: string): Observable<void>;
}
