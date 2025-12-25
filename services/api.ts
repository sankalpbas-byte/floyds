import { AppState, MenuItem, Transaction } from '../types';

export const api = {
  /**
   * Fetches persistent state from Cloudflare D1 via Pages Functions
   */
  async fetchState(phone?: string | null): Promise<Partial<AppState> | null> {
    try {
      const url = new URL('/api/state', window.location.origin);
      if (phone) url.searchParams.append('phone', phone);

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch state');
      
      const data = await response.json();
      return {
        menuItems: data.menuItems || [],
        transactions: data.transactions || [],
      };
    } catch (error) {
      console.warn('D1 fetch error (falling back to local):', error);
      return null;
    }
  },

  /**
   * Persists a single transaction to D1
   */
  async syncTransaction(transaction: Transaction): Promise<boolean> {
    try {
      const response = await fetch('/api/sync/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });
      if (!response.ok) throw new Error('Transaction sync failed');
      return true;
    } catch (error) {
      console.error('D1 sync error:', error);
      return false;
    }
  },

  /**
   * Syncs menu changes to D1 (Admin only)
   */
  async syncMenu(menuItems: MenuItem[]): Promise<boolean> {
    try {
      const response = await fetch('/api/sync/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuItems),
      });
      if (!response.ok) throw new Error('Menu sync failed');
      return true;
    } catch (error) {
      console.error('D1 menu sync error:', error);
      return false;
    }
  }
};