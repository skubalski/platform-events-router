import { DatabaseListenerMessage } from '../../../../../infrastructure/port/DatabaseListener';
import { RouterConfig } from '../../entity/RouterConfig';

export interface RouterConfigChange extends DatabaseListenerMessage {
  config: RouterConfig;
}
