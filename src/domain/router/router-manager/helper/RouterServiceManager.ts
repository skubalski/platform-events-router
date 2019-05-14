import { isNil } from 'lodash';

interface NewRouterServiceConfigs {
  routerServiceId: string;
  configIds: Set<number>;
}

type RouterServiceComparator = (val1: number, val2: number) => boolean;

export class RouterServiceManager {
  private routerConfigsByRouterService: Map<string, Set<number>> = new Map();

  public unregister(routerServiceId: string): Set<number> {
    if (this.routerConfigsByRouterService.has(routerServiceId)) {
      const routerConfigs: Set<number> = this.routerConfigsByRouterService.get(routerServiceId)!;
      this.routerConfigsByRouterService.delete(routerServiceId);
      return routerConfigs;
    }
    throw new Error('Cannot unregister not registered service');
  }

  public register(routerServiceId: string): void {
    this.routerConfigsByRouterService.set(routerServiceId, new Set());
  }

  public addConfig(routerServiceId: string, routerConfigId: number): void {
    if (this.routerConfigsByRouterService.has(routerServiceId)) {
      this.routerConfigsByRouterService.get(routerServiceId)!.add(routerConfigId);
    } else {
      throw new Error(`${routerServiceId} router service is not registered`);
    }
  }

  public getIterator(): IterableIterator<[string, Set<number>]> {
    return this.routerConfigsByRouterService.entries();
  }

  public getAscIterator(): IterableIterator<[string, Set<number>]> {
    return Array.from(this.getIterator())
      .sort(([_1, configs1], [_2, configs2]) => configs2.size - configs1.size)
      [Symbol.iterator]();
  }

  public getDescIterator(): IterableIterator<[string, Set<number>]> {
    return Array.from(this.getAscIterator()).reverse()[Symbol.iterator]();
  }

  public getMinRouterService(): string | null {
    return this.getRouterServiceByComparator(Infinity, (val1, val2) => val1 >= val2, this.getAscIterator());
  }

  public getMaxRouterService(): string | null {
    return this.getRouterServiceByComparator(0, (val1, val2) => val1 <= val2, this.getDescIterator());
  }

  public findRouterService(routerConfigId: number): string | null {
    for (const [routerServiceId, routerConfigIds] of this.getIterator()) {
      if (routerConfigIds.has(routerConfigId)) {
        return routerServiceId;
      }
    }
    return null;
  }

  public splitEqually(remainingConfigs: Set<number>): NewRouterServiceConfigs[] {
    const maxRouterService: string | null = this.getMaxRouterService();

    if (isNil(maxRouterService)) {
      throw new Error('Max router service has to be defined');
    }

    const orderedConfigs: number[] = Array.from(remainingConfigs);
    const maxRouterServiceSize: number = this.routerConfigsByRouterService.get(maxRouterService)!.size;

    const results: NewRouterServiceConfigs[] = [];
    for (const [routerServiceId, configs] of this.getAscIterator()) {
      const diff = maxRouterServiceSize - configs.size;
      if (diff <= 0) {
        continue;
      }

      const configIds: number[] = orderedConfigs.length > diff ? orderedConfigs.splice(0, diff) : orderedConfigs;

      results.push({
        routerServiceId,
        configIds: new Set(configIds)
      });
    }
    return results;
  }

  private getRouterServiceByComparator(
    initValue: number,
    comparator: RouterServiceComparator,
    iterator: IterableIterator<[string, Set<number>]>
  ): string | null {
    let minRouterServiceId: string | null = null;
    let comparableSize: number = initValue;
    for (const [routerServiceId, routerConfigs] of iterator) {
      if (comparator(comparableSize, routerConfigs.size)) {
        minRouterServiceId = routerServiceId;
        comparableSize = routerConfigs.size;
      }
    }
    return minRouterServiceId;
  }
}
