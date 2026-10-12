import type { AppState } from '../types';

export const STORAGE_KEY = 'ontrack2-trainer.v1';

export function defaultState(): AppState {
  return { version: 1, ownVocab: [], vocabStats: {}, topicStats: {}, mockResults: [] };
}

export function loadState(): AppState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return defaultState();
  try {
    const parsed = JSON.parse(raw) as Partial<AppState> | null;
    if (parsed?.version !== 1) {
      console.warn(`Gespeicherter Stand (${STORAGE_KEY}) hat unbekannte Version – starte neu.`);
      return defaultState();
    }
    return { ...defaultState(), ...parsed } as AppState;
  } catch (err) {
    console.warn(`Gespeicherter Stand (${STORAGE_KEY}) ist beschädigt – starte neu.`, err);
    return defaultState();
  }
}

export function saveState(s: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}
