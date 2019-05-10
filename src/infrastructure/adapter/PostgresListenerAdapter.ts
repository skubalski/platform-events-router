import { DatabaseListener, DatabaseListenerMessage } from '../port/DatabaseListener';
import { DatabaseTopic } from '../../config/database/DatabaseTopic';

export class PostgresListenerAdapter implements DatabaseListener {
  public async connect(): Promise<void> {
    // todo: tbi
  }

  public async publish<T extends DatabaseListenerMessage>(topic: DatabaseTopic, message: T): Promise<void> {
    // todo: tbi
  }

  public subscribe<T extends DatabaseListenerMessage>(
    topic: DatabaseTopic,
    callback: (message: T) => Promise<void>
  ): void {
    // todo: tbi
  }
}
