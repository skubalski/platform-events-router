import { MessageBrokerMessage } from '../../../../infrastructure/port/MessageBroker';
import { RouterConfig } from '../../router-manager/entity/RouterConfig';

export interface RouterConfigChanges extends MessageBrokerMessage {
  configs: RouterConfig[];
}
