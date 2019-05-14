import { EntityRepository, Repository } from 'typeorm';
import { RouterConfig } from '../entity/RouterConfig';
import { injectable } from 'inversify';
import { Observable, from } from 'rxjs';

@injectable()
@EntityRepository(RouterConfig)
export class RouterConfigRepository extends Repository<RouterConfig> {

  public getAllActive(): Observable<RouterConfig[]> {
    return from(this.find({ isActive: true }));
  }
}
