import { RouterConfig } from '../entity/RouterConfig';

export class RouterConfigManager {
  private routerConfigById: Map<number, RouterConfig> = new Map();

  public add(routerConfig: RouterConfig): void {
    this.routerConfigById.set(this.getId(routerConfig), routerConfig);
  }

  public addAll(routerConfigs: RouterConfig[]): void {
    for (const routerConfig of routerConfigs) {
      this.add(routerConfig);
    }
  }

  public deleteAll(routerConfigs: RouterConfig[]): void {
    for (const routerConfig of routerConfigs) {
      this.delete(routerConfig);
    }
  }

  public delete(routerConfig: RouterConfig): void {
    this.routerConfigById.delete(this.getId(routerConfig));
  }

  public set(routerConfigs: RouterConfig[]): void {
    this.routerConfigById.clear();
    this.addAll(routerConfigs);
  }

  public get(routerConfigId: number): RouterConfig | undefined {
    return this.routerConfigById.get(routerConfigId);
  }

  private getId(routerConfig: RouterConfig): number {
    return routerConfig.id;
  }
}
