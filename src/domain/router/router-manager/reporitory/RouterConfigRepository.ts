import { EntityRepository, Repository } from 'typeorm';
import { RouterConfig } from '../entity/RouterConfig';
import { injectable } from 'inversify';

@injectable()
@EntityRepository(RouterConfig)
export class RouterConfigRepository extends Repository<RouterConfig> {

  public getAllActive(): Promise<RouterConfig[]> {
    return this.find({ isActive: true });
  }
}
