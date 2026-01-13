// Real tables adapter - wraps existing RealTableStrategy from api/strategies

import { RealTableStrategy as OriginalRealTableStrategy } from '@/api/strategies/real';
import type { ITablesAdapter } from '../adapter.interface';

/**
 * Feature-owned real tables adapter
 * Wraps the existing RealTableStrategy to keep implementation minimal diff
 */
export class TablesAdapter implements ITablesAdapter {
  private delegate: OriginalRealTableStrategy;

  constructor() {
    this.delegate = new OriginalRealTableStrategy();
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
