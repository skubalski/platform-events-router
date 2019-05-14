import { Inject, Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { RouterConfigRepository } from '../reporitory/RouterConfigRepository';
import { RouterConfig } from '../entity/RouterConfig';
import { MessageBroker, MessageBrokerMessage } from '../../../../infrastructure/port/MessageBroker';
import { DatabaseListener } from '../../../../infrastructure/port/DatabaseListener';
import { DatabaseTopic } from '../../../../config/database/DatabaseTopic';
import { BrokerTopic } from '../../../../config/broker/BrokerTopic';
import { RouterRegistration } from '../../message/broker/RouterRegistration';
import { RouterConfigChange } from '../message/database/RouterConfigChange';
import { isNil } from 'lodash';
import { RouterConfigChanges } from '../../message/broker/RouterConfigChanges';
import { RouterConfigManager } from '../helper/RouterConfigManager';
import { RouterServiceUtility } from '../../utility/RouterServiceUtility';
import { RouterServiceIdGenerator } from '../utility/RouterServiceIdGenerator';
import { RouterServiceManager } from '../helper/RouterServiceManager';

@Service()
export class RouterManagerService {
  @InjectRepository()
  private readonly routerConfigRepository: RouterConfigRepository;

  @Inject()
  private readonly messageBroker: MessageBroker;

  @Inject()
  private readonly databaseListener: DatabaseListener;

  @Inject()
  private readonly routerServiceIdGenerator: RouterServiceIdGenerator;

  @Inject()
  private readonly routerServiceUtility: RouterServiceUtility;

  private routerConfigService: RouterConfigManager = new RouterConfigManager();

  private routerServiceManager: RouterServiceManager = new RouterServiceManager();

  public async run() {
    await this.retrieveRouterConfigs();
    this.subscribeRouterConfigActions();
    this.subscribeRouterRegistration();
    this.unsubscribeRouterRegistration();
  }

  private async retrieveRouterConfigs(): Promise<void> {
    const routerConfigs: RouterConfig[] = await this.routerConfigRepository.getAllActive();
    this.routerConfigService.set(routerConfigs);
  }

  private subscribeRouterConfigActions(): void {
    this.subscribeRouterConfigAdd();
    this.subscribeRouterConfigChange();
    this.subscribeRouterConfigDelete();
  }

  private subscribeRouterConfigDelete(): void {
    this.databaseListener.subscribe<RouterConfigChange>(
      DatabaseTopic.ROUTER_CONFIG_DELETE,
      async (message) => {
        this.routerConfigService.delete(message.config);
        const routerServiceId: string | null = this.routerServiceManager.findRouterService(message.config.id);
        if (!isNil(routerServiceId)) {
          await this.sendMessageToRouterService(BrokerTopic.ROUTER_CONFIG_DELETE, routerServiceId, message.config);
        }
      }
    );
  }

  private subscribeRouterConfigChange(): void {
    this.databaseListener.subscribe<RouterConfigChange>(
      DatabaseTopic.ROUTER_CONFIG_CHANGE,
      async (message) => {
        this.routerConfigService.add(message.config);
        const routerServiceId: string | null = this.routerServiceManager.findRouterService(message.config.id);
        if (!isNil(routerServiceId)) {
          await this.sendMessageToRouterService(BrokerTopic.ROUTER_CONFIG_CHANGE, routerServiceId, message.config);
        }
      }
    );
  }

  private subscribeRouterConfigAdd(): void {
    this.databaseListener.subscribe<RouterConfigChange>(
      DatabaseTopic.ROUTER_CONFIG_ADD,
      async (message) => {
        this.routerConfigService.add(message.config);
        const routerServiceId: string | null = this.routerServiceManager.getMinRouterService();
        if (!isNil(routerServiceId)) {
          await this.sendMessageToRouterService(BrokerTopic.ROUTER_CONFIG_ADD, routerServiceId, message.config);
        }
      }
    );
  }

  private subscribeRouterRegistration(): void {
    this.messageBroker.subscribe<MessageBrokerMessage>(
      BrokerTopic.ROUTER_REGISTER,
      async (message, replayTo) => {
        const routerServiceId: string = this.registerRouterService();

        await this.messageBroker.publish<RouterRegistration>(
          BrokerTopic.ROUTER_REGISTER,
          { id: routerServiceId },
          replayTo
        );

        // todo: divide router configs into all available services
      }
    );
  }

  private unsubscribeRouterRegistration(): void {
    this.messageBroker.subscribe<RouterRegistration>(
      BrokerTopic.ROUTER_UNREGISTER,
      async (message) => {
        const routerConfigs: Set<number> = this.routerServiceManager.unregister(message.id);

        for (const result of this.routerServiceManager.splitEqually(routerConfigs)) {
          await this.sendMessageToRouterService(
            BrokerTopic.ROUTER_CONFIG_ADD,
            result.routerServiceId,
            Array.from(result.configIds).map(configId => this.routerConfigService.get(configId)!)
          );
        }
      }
    );
  }

  private registerRouterService(): string {
    const routerServiceId: string = this.routerServiceIdGenerator.getId();
    this.routerServiceManager.register(routerServiceId);
    return routerServiceId;
  }

  private async sendMessageToRouterService(
    topic: BrokerTopic,
    routerServiceId: string,
    configs: RouterConfig | RouterConfig[]
  ): Promise<void> {
    await this.messageBroker.publish<RouterConfigChanges>(
      this.routerServiceUtility.buildRouterServiceTopic(topic, routerServiceId),
      { configs: Array.isArray(configs) ? configs : [configs] }
    );
  }
}
