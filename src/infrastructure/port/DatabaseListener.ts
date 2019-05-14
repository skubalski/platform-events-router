import { DatabaseTopic } from '../../config/database/DatabaseTopic';
import { Observable } from 'rxjs';

export interface DatabaseListener {
  subscribe<T>(topic: DatabaseTopic): Observable<T>;

  publish<T>(topic: DatabaseTopic, message: T): Observable<void>;
}
