// Mock tables adapter - wraps existing MockTableStrategy from api/strategies

import { MockTableStrategy as OriginalMockTableStrategy } from '@/api/strategies/mock';
import type { ITablesAdapter } from '../adapter.interface';

/**
 * Feature-owned mock tables adapter
 * Wraps the existing MockTableStrategy to keep implementation minimal diff
 */
export class MockTablesAdapter implements ITablesAdapter {
  private delegate: OriginalMockTableStrategy;

  constructor() {
    this.delegate = new OriginalMockTableStrategy();
  }

  async validateQRToken(token: string) {
    return this.delegate.validateQRToken(token);
  }
  
  async getCurrentSession() {
    return this.delegate.getCurrentSession();
  }
  
  async getTableInfo(tableId: string) {
    return this.delegate.getTableInfo(tableId);
  }
}
