import 'reflect-metadata';
import { Inject, Service } from 'typedi';
import { isNil, isEmpty } from 'lodash';
import { MessageBroker, MessageBrokerMessage } from '../../../../infrastructure/port/MessageBroker';
import { RouterServiceUtility } from '../../utility/RouterServiceUtility';
import { RouterRegistration } from '../../message/broker/RouterRegistration';
import { BrokerTopic } from '../../../../config/broker/BrokerTopic';
import { RouterConfigChanges } from '../../message/broker/RouterConfigChanges';

@Service()
export class RouterService {
  private serviceId: string;

  @Inject()
  private readonly messageBroker: MessageBroker;

  @Inject()
  private readonly routerServiceUtility: RouterServiceUtility;

  public async run(): Promise<void> {
    await this.register();
    this.subscribeRouterConfigChanges();
  }

  private async register(): Promise<void> {
    const response: RouterRegistration = await this.messageBroker.requestOnce<MessageBrokerMessage, RouterRegistration>(
      BrokerTopic.ROUTER_REGISTER
    );

    if (isNil(response) || isEmpty(response.id)) {
      throw new Error('Service id is required');
    }
    this.serviceId = response.id;
  }

  private subscribeRouterConfigChanges(): void {
    this.messageBroker.subscribe<RouterConfigChanges>(
      this.getTopic(BrokerTopic.ROUTER_CONFIG_ADD),
      async (message) => {
        // todo: add jsforce subscription
      }
    );

    this.messageBroker.subscribe<RouterConfigChanges>(
      this.getTopic(BrokerTopic.ROUTER_CONFIG_CHANGE),
      async (message) => {
        // todo: removed old jsforce subscription and create new
      }
    );

    this.messageBroker.subscribe<RouterConfigChanges>(
      this.getTopic(BrokerTopic.ROUTER_CONFIG_DELETE),
      async (message) => {
        // todo: remove jsforce subscription
      }
    );
  }

  private getTopic(topic: BrokerTopic) {
    return this.routerServiceUtility.buildRouterServiceTopic(topic, this.serviceId);
  }
}
