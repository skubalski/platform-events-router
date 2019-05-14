import { Subscription } from 'rxjs';

export class RouteManager {
  private subscriptionByConfigId: Map<number, Subscription> = new Map();

  public add(routerConfigId: number, subscription: Subscription): void {
    this.subscriptionByConfigId.set(routerConfigId, subscription);
  }

  public get(routerConfigId: number): Subscription {
    if (this.subscriptionByConfigId.has(routerConfigId)) {
      return this.subscriptionByConfigId.get(routerConfigId)!;
    }
    throw new Error(`Subscription for ${routerConfigId} does not exist`);
  }

  public delete(routerConfigId: number): Subscription {
    const subscription: Subscription = this.get(routerConfigId);
    this.subscriptionByConfigId.delete(routerConfigId);
    return subscription;
  }
}
