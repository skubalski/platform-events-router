import 'reflect-metadata';
import { Inject, Service } from 'typedi';
import { isNil, isEmpty } from 'lodash';
import { MessageBroker } from '../../../../infrastructure/port/MessageBroker';
import { RouterServiceUtility } from '../../utility/RouterServiceUtility';
import { RouterRegistration } from '../../message/broker/RouterRegistration';
import { BrokerTopic } from '../../../../config/broker/BrokerTopic';
import { RouterConfigChanges } from '../../message/broker/RouterConfigChanges';
import { map, filter, throwIfEmpty, switchMap } from 'rxjs/operators';
import { Observable, concat, of } from 'rxjs';

@Service()
export class RouterService {
  private serviceId: string;

  @Inject()
  private readonly messageBroker: MessageBroker;

  @Inject()
  private readonly routerServiceUtility: RouterServiceUtility;

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
        map(message => void)
        // todo: add jsforce subscription
      );
  }

  private subscribeRouterConfigChange(): Observable<void> {
    return this.messageBroker.subscribe<RouterConfigChanges>(this.getTopic(BrokerTopic.ROUTER_CONFIG_CHANGE))
      .pipe(
        map(message => void)
        // todo: removed old jsforce subscription and create new
      );
  }

  private subscribeRouterConfigDelete(): Observable<void> {
    return this.messageBroker.subscribe<RouterConfigChanges>(this.getTopic(BrokerTopic.ROUTER_CONFIG_DELETE))
      .pipe(
        map(message => void)
        // todo: remove jsforce subscription
      );
  }

  private getTopic(topic: BrokerTopic) {
    return this.routerServiceUtility.buildRouterServiceTopic(topic, this.serviceId);
  }
}
