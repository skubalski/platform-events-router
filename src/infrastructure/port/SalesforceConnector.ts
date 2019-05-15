import { Observable } from 'rxjs';
import { Token } from 'typedi';

export interface SalesforceConnector {
  subscribe<T>(topic: string): Observable<T>;

  unsubscribe(topic: string): Observable<void>;
}

export const SalesforceConnectorToken = new Token<SalesforceConnector>();
