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
import { map, filter, switchMap, mergeMap } from 'rxjs/operators';
import { Observable, concat } from 'rxjs';

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

  public run() {
    concat(
      this.retrieveRouterConfigs(),
      this.subscribeRouterConfigActions(),
      this.subscribeRouterRegistration(),
      this.unsubscribeRouterRegistration()
    )
      .subscribe();
  }

  private retrieveRouterConfigs(): Observable<void> {
    return this.routerConfigRepository.getAllActive()
      .pipe(
        mergeMap(routerConfigs => routerConfigs),
        map(routerConfig => this.routerConfigService.add(routerConfig))
      );
  }

  private subscribeRouterConfigActions(): Observable<void> {
    return concat(
      this.subscribeRouterConfigAdd(),
      this.subscribeRouterConfigChange(),
      this.subscribeRouterConfigDelete()
    );
  }

  private subscribeRouterConfigDelete(): Observable<void> {
    return this.databaseListener.subscribe<RouterConfigChange>(DatabaseTopic.ROUTER_CONFIG_DELETE)
      .pipe(
        map(
          (message) => {
            this.routerConfigService.delete(message.config);
            return message;
          }
        ),
        map(
          (message) => {
            const routerServiceId: string | null = this.routerServiceManager.findRouterService(message.config.id);
            return {
              routerServiceId,
              ...message
            };
          }
        ),
        filter(({ routerServiceId }) => !isNil(routerServiceId)),
        switchMap(
          ({ routerServiceId, config }) =>
            this.sendMessageToRouterService(BrokerTopic.ROUTER_CONFIG_DELETE, routerServiceId!, config)
        )
      );
  }

  private subscribeRouterConfigChange(): Observable<void> {
    return this.databaseListener.subscribe<RouterConfigChange>(DatabaseTopic.ROUTER_CONFIG_DELETE)
      .pipe(
        map(
          (message) => {
            this.routerConfigService.add(message.config);
            return message;
          }
        ),
        map(
          (message) => {
            return {
              ...message,
              routerServiceId: this.routerServiceManager.findRouterService(message.config.id)
            };
          }
        ),
        filter(({ routerServiceId }) => !isNil(routerServiceId)),
        switchMap(
          ({ routerServiceId, config }) =>
            this.sendMessageToRouterService(BrokerTopic.ROUTER_CONFIG_CHANGE, routerServiceId!, config)
        )
      );
  }

  private subscribeRouterConfigAdd(): Observable<void> {
    return this.databaseListener.subscribe<RouterConfigChange>(DatabaseTopic.ROUTER_CONFIG_ADD)
      .pipe(
        map(
          (message) => {
            this.routerConfigService.add(message.config);
            return message;
          }
        ),
        map(
          (message) => {
            return {
              ...message,
              routerServiceId: this.routerServiceManager.getMinRouterService()
            };
          }
        ),
        filter(({ routerServiceId }) => !isNil(routerServiceId)),
        switchMap(
          ({ routerServiceId, config }) =>
            this.sendMessageToRouterService(BrokerTopic.ROUTER_CONFIG_ADD, routerServiceId!, config)
        )
      );
  }

  private subscribeRouterRegistration(): Observable<void> {
    return this.messageBroker.subscribe<MessageBrokerMessage<void>>(BrokerTopic.ROUTER_REGISTER)
      .pipe(
        map(({ replayTo }) => ({
          replayTo,
          message: { id: this.registerRouterService() }
        })),
        switchMap(({ replayTo, message }) => (
          this.messageBroker.publish<RouterRegistration>(
            BrokerTopic.ROUTER_REGISTER,
            message,
            replayTo
          )
        )),
        // todo: divide router configs into all available services
      );
  }

  private unsubscribeRouterRegistration(): Observable<void> {
    return this.messageBroker.subscribe<RouterRegistration>(BrokerTopic.ROUTER_UNREGISTER)
      .pipe(
        map(message => message.message.id),
        map(id => this.routerServiceManager.unregister(id)),
        mergeMap(routerConfigs => this.routerServiceManager.splitEqually(routerConfigs)),
        map(({ configIds, routerServiceId }) => ({
          routerServiceId,
          configIds: Array.from(configIds).map(configId => this.routerConfigService.get(configId)!)
        })),
        switchMap(({ configIds, routerServiceId }) => (
          this.sendMessageToRouterService(BrokerTopic.ROUTER_CONFIG_ADD, routerServiceId, configIds)
        ))
      );
  }

  private registerRouterService(): string {
    const routerServiceId: string = this.routerServiceIdGenerator.getId();
    this.routerServiceManager.register(routerServiceId);
    return routerServiceId;
  }

  private sendMessageToRouterService(
    topic: BrokerTopic,
    routerServiceId: string,
    configs: RouterConfig | RouterConfig[]
  ): Observable<void> {
    return this.messageBroker.publish<RouterConfigChanges>(
      this.routerServiceUtility.buildRouterServiceTopic(topic, routerServiceId),
      { configs: Array.isArray(configs) ? configs : [configs] }
    );
  }
}
