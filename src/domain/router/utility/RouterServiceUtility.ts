import { BrokerTopic } from '../../../config/broker/BrokerTopic';
import { Service } from 'typedi';

@Service()
export class RouterServiceUtility {
  public buildRouterServiceTopic(topic: BrokerTopic, routerServiceId: string): string {
    return `${topic}.${routerServiceId}`;
  }
}
