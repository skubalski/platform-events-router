import { DatabaseListener, DatabaseListenerToken } from '../port/DatabaseListener';
import { DatabaseTopic } from '../../config/database/DatabaseTopic';
import { Service } from 'typedi';
import { Observable, of } from 'rxjs';

@Service(DatabaseListenerToken)
export class PostgresListenerAdapter implements DatabaseListener {
  public publish<T>(topic: DatabaseTopic, message: T): Observable<void> {
    // todo: tbi
    return of();
  }

  public subscribe<T>(topic: DatabaseTopic): Observable<T> {
    // todo: tbi
    return of();
  }
}
