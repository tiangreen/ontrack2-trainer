import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadState, saveState } from './logic/storage';
import type { AppState, MockResultRecord, TopicId, VocabEntry } from './types';

interface AppStateApi {
  state: AppState;
  recordVocab(id: string, right: boolean): void;
  recordTopic(topicId: TopicId, percent: number): void;
  addOwnVocab(entries: VocabEntry[]): void;
  removeOwnVocab(id: string): void;
  clearOwnVocab(): void;
  addMockResult(r: MockResultRecord): void;
  resetProgress(): void;
}

const Ctx = createContext<AppStateApi | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(loadState);

  useEffect(() => saveState(state), [state]);

  const api = useMemo<AppStateApi>(
    () => ({
      state,
      recordVocab: (id, right) =>
        setState((s) => {
          const prev = s.vocabStats[id] ?? { right: 0, wrong: 0, last: 'wrong' };
          const next = right
            ? { right: prev.right + 1, wrong: prev.wrong, last: 'right' as const }
            : { right: prev.right, wrong: prev.wrong + 1, last: 'wrong' as const };
          return { ...s, vocabStats: { ...s.vocabStats, [id]: next } };
        }),
      recordTopic: (topicId, percent) =>
        setState((s) => {
          const prev = s.topicStats[topicId];
          const next = {
            attempts: (prev?.attempts ?? 0) + 1,
            lastPercent: percent,
            bestPercent: Math.max(prev?.bestPercent ?? 0, percent),
          };
          return { ...s, topicStats: { ...s.topicStats, [topicId]: next } };
        }),
      addOwnVocab: (entries) => setState((s) => ({ ...s, ownVocab: [...s.ownVocab, ...entries] })),
      removeOwnVocab: (id) => setState((s) => ({ ...s, ownVocab: s.ownVocab.filter((e) => e.id !== id) })),
      clearOwnVocab: () => setState((s) => ({ ...s, ownVocab: [] })),
      addMockResult: (r) => setState((s) => ({ ...s, mockResults: [...s.mockResults, r] })),
      resetProgress: () => setState((s) => ({ ...s, vocabStats: {}, topicStats: {}, mockResults: [] })),
    }),
    [state],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react/only-export-components
export function useAppState(): AppStateApi {
  const api = useContext(Ctx);
  if (!api) throw new Error('useAppState außerhalb von AppStateProvider');
  return api;
}
