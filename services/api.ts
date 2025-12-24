
import { AppState, MenuItem, Transaction } from '../types';

// We default to '/api' so it works automatically with Cloudflare Pages Functions
// Safely access VITE_API_URL using optional chaining to prevent crashes if env is undefined
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export const api = {
  async fetchState(): Promise<Partial<AppState> | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/state`);
      if (!response.ok) throw new Error('Failed to fetch state');
      return await response.json();
    } catch (error) {
      // It is normal to fail on local dev without the backend running
      // The AppContext will handle the fallback to localStorage
      console.log('API not available, using local storage.');
      return null;
    }
  },

  async syncTransaction(transaction: Transaction): Promise<boolean> {
    try {
      await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });
      return true;
    } catch (error) {
      console.error('API Sync Error:', error);
      return false;
    }
  },

  async syncMenu(menuItems: MenuItem[]): Promise<boolean> {
    try {
      await fetch(`${API_BASE_URL}/menu`, {
        method: 'POST', // or PUT
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuItems),
      });
      return true;
    } catch (error) {
      console.error('API Sync Error:', error);
      return false;
    }
  }
};
