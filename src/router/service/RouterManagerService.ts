import 'reflect-metadata';
import { Inject, Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { RouterConfigRepository } from '../reporitory/RouterConfigRepository';
import { RouterConfig } from '../entity/RouterConfig';
import { MessageBroker, MessageBrokerMessage } from '../../infrastructure/port/MessageBroker';
import { DatabaseListener } from '../../infrastructure/port/DatabaseListener';
import { DatabaseTopic } from '../../config/database/DatabaseTopic';
import { BrokerTopic } from '../../config/broker/BrokerTopic';
import { RouterRegistration } from '../messages/broker/RouterRegistration';
import { RouterConfigChange } from '../messages/database/RouterConfigChange';
import { isNil } from 'lodash';

@Service()
export class RouterManagerService {
  private routerConfigById: Map<number, RouterConfig> = new Map();
  private routerConfigsByRouterService: Map<string, Set<number>> = new Map();

  public constructor(
    @InjectRepository() private readonly routerConfigRepository: RouterConfigRepository,
    @Inject() private readonly messageBroker: MessageBroker,
    @Inject() private readonly databaseListener: DatabaseListener
  ) {
  }

  public async run() {
    await this.init();
    this.subscribeRouterConfigChanges();
    this.subscribeRouterRegistration();
    this.unsubscribeRouterRegistration();
  }

  private async init(): Promise<void> {
    await this.messageBroker.connect();
    await this.databaseListener.connect();
    await this.retrieveRouterConfigs();
  }

  private async retrieveRouterConfigs(): Promise<void> {
    this.routerConfigById.clear();
    const routerConfigs: RouterConfig[] = await this.routerConfigRepository.getAllActive();
    for (const routerConfig of routerConfigs) {
      this.addRouterConfigById(routerConfig);
    }
  }

  private addRouterConfigById(routerConfig: RouterConfig): void {
    this.routerConfigById.set(routerConfig.id, routerConfig);
  }

  private removeRouterConfigById(routerConfig: RouterConfig): void {
    this.routerConfigById.delete(routerConfig.id);
  }

  private subscribeRouterConfigChanges(): void {
    this.databaseListener.subscribe<RouterConfigChange>(
      DatabaseTopic.ROUTER_CONFIG_ADD,
      async (message: RouterConfigChange) => {
        this.addRouterConfigById(message.config);
        const routerServiceId: string | null = this.getMinRouterService();
        if (!isNil(routerServiceId)) {
          this.messageBroker.publish<RouterConfig>(
            this.buildRouterServiceTopic(BrokerTopic.ROUTER_CONFIG_ADD, routerServiceId),
            message.config
          );
        }
      }
    );

    this.databaseListener.subscribe<RouterConfigChange>(
      DatabaseTopic.ROUTER_CONFIG_CHANGE,
      async (message: RouterConfigChange) => {
        this.addRouterConfigById(message.config);
        const routerServiceId: string | null = this.findRouterService(message.config.id);
        if (!isNil(routerServiceId)) {
          this.messageBroker.publish<RouterConfig>(
            this.buildRouterServiceTopic(BrokerTopic.ROUTER_CONFIG_CHANGE, routerServiceId),
            message.config
          );
        }
      }
    );

    this.databaseListener.subscribe<RouterConfigChange>(
      DatabaseTopic.ROUTER_CONFIG_DELETE,
      async (message: RouterConfigChange) => {
        this.removeRouterConfigById(message.config);
        const routerServiceId: string | null = this.findRouterService(message.config.id);
        if (!isNil(routerServiceId)) {
          this.messageBroker.publish<RouterConfig>(
            this.buildRouterServiceTopic(BrokerTopic.ROUTER_CONFIG_DELETE, routerServiceId),
            message.config
          );
        }
      }
    );
  }

  private subscribeRouterRegistration() {
    this.messageBroker.subscribe<MessageBrokerMessage>(
      BrokerTopic.ROUTER_REGISTER,
      async (message: MessageBrokerMessage, replayTo: string) => {
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

  private unsubscribeRouterRegistration() {
    this.messageBroker.subscribe<RouterRegistration>(
      BrokerTopic.ROUTER_UNREGISTER,
      async (message) => {
        const routerConfigs: Set<number> = this.unregisterRouterService(message.id);
        // todo: split remaining configs for other services
      }
    );
  }

  private registerRouterService(): string {
    const routerServiceId: string = this.generateRouterServiceId();
    this.routerConfigsByRouterService.set(routerServiceId, new Set());

    return routerServiceId;
  }

  private unregisterRouterService(routerServiceId: string): Set<number> {
    if (this.routerConfigsByRouterService.has(routerServiceId)) {
      return new Set();
    }
    const routerConfigs: Set<number> = this.routerConfigsByRouterService.get(routerServiceId)!;
    this.routerConfigsByRouterService.delete(routerServiceId);
    return routerConfigs;
  }

  private getMinRouterService(): string | null {
    let minSize: number = Infinity;
    let minRouterServiceId: string | null = null;
    for (const [routerServiceId, routerConfigs] of this.routerConfigsByRouterService.entries()) {
      if (routerConfigs.size < minSize) {
        minRouterServiceId = routerServiceId;
        minSize = routerConfigs.size;
      }
    }
    return minRouterServiceId;
  }

  private findRouterService(routerConfigId: number): string | null {
    for (const [routerServiceId, routerConfigIds] of this.routerConfigsByRouterService.entries()) {
      if (routerConfigIds.has(routerConfigId)) {
        return routerServiceId;
      }
    }
    return null;
  }

  private generateRouterServiceId(): string {
    return ''; // todo: tbi
  }

  private buildRouterServiceTopic(topic: BrokerTopic, routerServiceId: string): string {
    return `${topic}.${routerServiceId}`;
  }
}
