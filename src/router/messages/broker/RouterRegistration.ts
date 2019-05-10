import { MessageBrokerMessage } from '../../../infrastructure/port/MessageBroker';

export interface RouterRegistration extends MessageBrokerMessage {
  id: string;
}
