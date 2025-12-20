// Strategy Factory - creates appropriate strategies based on API mode

import { USE_MOCK_API } from '@/lib/constants';
import { IMenuStrategy, ITableStrategy, IOrderStrategy } from './interfaces';
import { RealMenuStrategy, RealTableStrategy, RealOrderStrategy } from './real';
import { MockMenuStrategy, MockTableStrategy, MockOrderStrategy } from './mock';

export class StrategyFactory {
  static createMenuStrategy(): IMenuStrategy {
    return USE_MOCK_API ? new MockMenuStrategy() : new RealMenuStrategy();
  }
  
  static createTableStrategy(): ITableStrategy {
    return USE_MOCK_API ? new MockTableStrategy() : new RealTableStrategy();
  }
  
  static createOrderStrategy(): IOrderStrategy {
    return USE_MOCK_API ? new MockOrderStrategy() : new RealOrderStrategy();
  }
}
