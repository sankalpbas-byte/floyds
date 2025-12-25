import { AppState, MenuItem, Transaction } from '../types';

export const api = {
  /**
   * Fetches persistent state from Cloudflare D1
   */
  async fetchState(phone?: string | null): Promise<Partial<AppState> | null> {
    try {
      const url = phone ? `/api/state?phone=${encodeURIComponent(phone)}` : '/api/state';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch state');
      return await response.json();
    } catch (error) {
      console.error('API Error (fetchState):', error);
      return null;
    }
  },

  /**
   * Persists a single transaction (order, load, etc.) to D1
   */
  async syncTransaction(transaction: Transaction): Promise<boolean> {
    try {
      const response = await fetch('/api/sync/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });
      return response.ok;
    } catch (error) {
      console.error('API Error (syncTransaction):', error);
      return false;
    }
  },

  /**
   * Persists the entire menu to D1 (Admin only)
   */
  async syncMenu(menuItems: MenuItem[]): Promise<boolean> {
    try {
      const response = await fetch('/api/sync/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuItems),
      });
      return response.ok;
    } catch (error) {
      console.error('API Error (syncMenu):', error);
      return false;
    }
  }
};
