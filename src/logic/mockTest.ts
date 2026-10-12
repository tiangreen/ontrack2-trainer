import { grammarTopics } from '../data/grammar';
import { mediationItems } from '../data/mediation';
import type { ChoiceItem, GapItem, MediationItem, VocabEntry, WorkshopId, WriteItem } from '../types';
import { shuffle } from './random';

export type MockQuestion =
  | { section: 'A'; type: 'vocab'; entry: VocabEntry; points: 1 }
  | { section: 'B'; type: 'item'; item: GapItem | ChoiceItem; points: 1 }
  | { section: 'C'; type: 'item'; item: WriteItem; points: 2 }
  | { section: 'D'; type: 'mediation'; item: MediationItem; points: 2 };

export const MOCK_COUNTS = { A: 8, B: 12, C: 3, D: 2 } as const;

export function buildMockTest(workshops: WorkshopId[], vocab: VocabEntry[], rng: () => number): MockQuestion[] {
  if (workshops.length === 0) throw new Error('Bitte mindestens einen Workshop wählen');
  const topics = grammarTopics.filter((t) => workshops.includes(t.workshop));

  const vocabPool = shuffle(
    vocab.filter((v) => workshops.includes(v.workshop)),
    rng,
  );
  const a = vocabPool.slice(0, MOCK_COUNTS.A);

  // Round-robin over (shuffled) topics so every topic appears before any repeats.
  const pools = shuffle(topics, rng).map((t) =>
    shuffle(
      t.items.filter((i): i is GapItem | ChoiceItem => i.kind !== 'write'),
      rng,
    ),
  );
  const b: (GapItem | ChoiceItem)[] = [];
  while (b.length < MOCK_COUNTS.B && pools.some((p) => p.length > 0)) {
    for (const pool of pools) {
      const next = pool.pop();
      if (next && b.length < MOCK_COUNTS.B) b.push(next);
    }
  }

  const writePool = topics.flatMap((t) => t.items.filter((i): i is WriteItem => i.kind === 'write'));
  const c = shuffle(writePool, rng).slice(0, MOCK_COUNTS.C);

  const d = shuffle(
    mediationItems.filter((m) => workshops.includes(m.workshop)),
    rng,
  ).slice(0, MOCK_COUNTS.D);

  return [
    ...a.map((entry) => ({ section: 'A' as const, type: 'vocab' as const, entry, points: 1 as const })),
    ...shuffle(b, rng).map((item) => ({ section: 'B' as const, type: 'item' as const, item, points: 1 as const })),
    ...c.map((item) => ({ section: 'C' as const, type: 'item' as const, item, points: 2 as const })),
    ...d.map((item) => ({ section: 'D' as const, type: 'mediation' as const, item, points: 2 as const })),
  ];
}
