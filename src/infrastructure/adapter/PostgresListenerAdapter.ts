import 'reflect-metadata';
import { DatabaseListener, DatabaseListenerMessage } from '../port/DatabaseListener';
import { DatabaseTopic } from '../../config/database/DatabaseTopic';
import { Service } from 'typedi';

@Service()
export class PostgresListenerAdapter implements DatabaseListener {
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
