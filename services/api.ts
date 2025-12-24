
import { AppState, MenuItem, Transaction } from '../types';

// Replace this with your actual Cloudflare Worker URL
const API_BASE_URL = 'https://floyds-api.your-worker.workers.dev';

// Helper to determine if we have a valid backend URL configured
const hasBackend = () => API_BASE_URL && !API_BASE_URL.includes('your-worker');

export const api = {
  async fetchState(): Promise<Partial<AppState> | null> {
    if (!hasBackend()) return null;
    try {
      const response = await fetch(`${API_BASE_URL}/state`);
      if (!response.ok) throw new Error('Failed to fetch state');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },

  async syncTransaction(transaction: Transaction): Promise<boolean> {
    if (!hasBackend()) return false;
    try {
      await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });
      return true;
    } catch (error) {
      console.error('API Error:', error);
      return false;
    }
  },

  async syncMenu(menuItems: MenuItem[]): Promise<boolean> {
    if (!hasBackend()) return false;
    try {
      await fetch(`${API_BASE_URL}/menu`, {
        method: 'POST', // or PUT
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuItems),
      });
      return true;
    } catch (error) {
      console.error('API Error:', error);
      return false;
    }
  }
};
