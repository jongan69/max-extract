import { RuggerAccount } from '../types';

const STORAGE_KEY = 'mass-extract-app';

interface AppState {
  accounts: RuggerAccount[];
}

export const getInitialState = (): AppState => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
  }
  
  return { accounts: [] };
};

export const saveState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
};