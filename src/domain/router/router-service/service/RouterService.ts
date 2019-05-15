import { Inject, Service } from 'typedi';
import { isNil, isEmpty } from 'lodash';
import { MessageBroker, MessageBrokerToken } from '../../../../infrastructure/port/MessageBroker';
import { RouterServiceUtility } from '../../utility/RouterServiceUtility';
import { RouterRegistration } from '../../message/broker/RouterRegistration';
import { BrokerTopic } from '../../../../config/broker/BrokerTopic';
import { RouterConfigChanges } from '../../message/broker/RouterConfigChanges';
import { map, filter, throwIfEmpty, switchMap, tap } from 'rxjs/operators';
import { Observable, concat, of } from 'rxjs';
import { SalesforceConnector, SalesforceConnectorToken } from '../../../../infrastructure/port/SalesforceConnector';
import { RouterConfigManager } from '../../helper/RouterConfigManager';
import { RouteManager } from '../helper/RouteManager';
import { PlatformEventTopicGenerator } from '../utility/PlatformEventTopicGenerator';
import { RouterConfig } from '../../router-manager/entity/RouterConfig';
import { ObservableUtility } from '../../router-manager/utility/ObservableUtility';

@Service()
export class RouterService {
  private serviceId: string;

  @Inject(MessageBrokerToken)
  private readonly messageBroker: MessageBroker;

  @Inject()
  private readonly routerServiceUtility: RouterServiceUtility;

  @Inject(SalesforceConnectorToken)
  private readonly salesforceConnector: SalesforceConnector;

  @Inject()
  private readonly platformEventTopicGenerator: PlatformEventTopicGenerator;

  @Inject()
  private readonly observableUtility: ObservableUtility;

  private routerConfigManager: RouterConfigManager = new RouterConfigManager();

  private routeManager: RouteManager = new RouteManager();

  public run(): void {
    concat(
      this.register(),
      this.subscribeRouterConfigChanges()
    )
      .subscribe();
  }

  private register(): Observable<void> {
    return this.messageBroker.requestOnce<void, RouterRegistration>(BrokerTopic.ROUTER_REGISTER)
      .pipe(
        filter(response => !isNil(response)),
        map(response => response.id),
        filter(id => !isEmpty(id)),
        map(id => this.serviceId = id),
        throwIfEmpty(() => new Error('Service id is required')),
        switchMap(() => of<void>())
      );
  }

  private subscribeRouterConfigChanges(): Observable<void> {
    return concat(
      this.subscribeRouterConfigAdd(),
      this.subscribeRouterConfigChange(),
      this.subscribeRouterConfigDelete()
    );
  }

  private subscribeRouterConfigAdd(): Observable<void> {
    return this.messageBroker.subscribe<RouterConfigChanges>(this.getTopic(BrokerTopic.ROUTER_CONFIG_ADD))
      .pipe(
        this.observableUtility.flagMessages,
        this.addRouterConfig
      );
  }

  private subscribeRouterConfigChange(): Observable<void> {
    return this.messageBroker.subscribe<RouterConfigChanges>(this.getTopic(BrokerTopic.ROUTER_CONFIG_CHANGE))
      .pipe(
        this.observableUtility.flagMessages,
        this.deleteRouterConfig,
        this.addRouterConfig
      );
  }

  private subscribeRouterConfigDelete(): Observable<void> {
    return this.messageBroker.subscribe<RouterConfigChanges>(this.getTopic(BrokerTopic.ROUTER_CONFIG_DELETE))
      .pipe(
        this.observableUtility.flagMessages,
        this.deleteRouterConfig,
        this.observableUtility.empty
      );
  }

  private deleteRouterConfig(observable: Observable<RouterConfig>): Observable<RouterConfig> {
    return observable.pipe(
      map((config) => {
        this.routerConfigManager.delete(config);
        return config;
      }),
      map((config) => {
        this.routeManager.delete(config.id).unsubscribe();
        return config;
      })
    );
  }

  private addRouterConfig(observable: Observable<RouterConfig>): Observable<void> {
    return observable.pipe(
      map((config) => {
        this.routerConfigManager.add(config);
        return config;
      }),
      map((config) => {
        const subscription = this.salesforceConnector.subscribe(
          this.platformEventTopicGenerator.generateTopic(config.platformChannel)
        )
          .pipe(
            tap(message => this.messageBroker.publish(config.herokuChannel, message).subscribe())
            // todo: add error handling
          )
          .subscribe();
        return { subscription, configId: config.id };
      }),
      map(({ subscription, configId }) => this.routeManager.add(configId, subscription))
    );
  }

  private getTopic(topic: BrokerTopic) {
    return this.routerServiceUtility.buildRouterServiceTopic(topic, this.serviceId);
  }
}
