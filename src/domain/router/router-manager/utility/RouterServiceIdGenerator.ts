import { v4 as uuidV4 } from 'uuid';
import { Service } from 'typedi';

@Service()
export class RouterServiceIdGenerator {
  public getId(): string {
    return uuidV4();
  }
}
