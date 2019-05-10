import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';
import { RouterConfig } from '../entity/RouterConfig';

@Service()
@EntityRepository(RouterConfig)
export class RouterConfigRepository extends Repository<RouterConfig> {

  public getAllActive(): Promise<RouterConfig[]> {
    return this.find({ isActive: true });
  }
}
