import { describe, expect, it } from 'vitest';
import { grammarTopics } from '../data/grammar';
import { starterVocab } from '../data/vocab';
import { buildMockTest, type MockQuestion } from './mockTest';
import { mulberry32 } from './random';

const topicOfItem = new Map(grammarTopics.flatMap((t) => t.items.map((i) => [i.id, t] as const)));
const idOf = (q: MockQuestion) => (q.type === 'vocab' ? q.entry.id : q.item.id);

describe('buildMockTest', () => {
  const both = buildMockTest(['W1', 'W2'], starterVocab, mulberry32(42));

  it('builds 8/12/3/2 questions worth 30 points', () => {
    const count = (s: string) => both.filter((q) => q.section === s).length;
    expect([count('A'), count('B'), count('C'), count('D')]).toEqual([8, 12, 3, 2]);
    expect(both.reduce((sum, q) => sum + q.points, 0)).toBe(30);
  });

  it('contains no duplicate questions', () => {
    const ids = both.map(idOf);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('covers every grammar topic in part B', () => {
    const covered = new Set(both.filter((q) => q.section === 'B').map((q) => topicOfItem.get(idOf(q))?.id));
    expect([...covered].sort()).toEqual(grammarTopics.map((t) => t.id).sort());
  });

  it('only uses the chosen workshop', () => {
    const w1 = buildMockTest(['W1'], starterVocab, mulberry32(7));
    for (const q of w1) {
      const ws = q.type === 'vocab' || q.type === 'mediation' ? (q.type === 'vocab' ? q.entry : q.item).workshop : topicOfItem.get(q.item.id)?.workshop;
      expect(ws).toBe('W1');
    }
    expect(w1.length).toBe(25);
  });

  it('is deterministic for the same seed', () => {
    expect(buildMockTest(['W1', 'W2'], starterVocab, mulberry32(42))).toEqual(both);
  });

  it('throws without workshops', () => {
    expect(() => buildMockTest([], starterVocab, mulberry32(1))).toThrow('Bitte mindestens einen Workshop wählen');
  });
});
