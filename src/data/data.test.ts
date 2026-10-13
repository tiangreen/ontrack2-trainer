import { describe, expect, it } from 'vitest';
import { checkItem } from '../logic/answers';
import type { TopicId, VocabTopic } from '../types';
import { grammarTopics } from './grammar';
import { irregularVerbs } from './irregularVerbs';
import { mediationItems } from './mediation';
import { starterVocab } from './vocab';

const MIN_ITEMS: Record<Exclude<TopicId, 'irregular-verbs'>, number> = {
  'simple-present': 28,
  'present-progressive': 28,
  'going-to': 36,
  'timetable-future': 24,
  will: 20,
  'going-to-vs-will': 20,
  comparison: 25,
  'past-progressive': 20,
  'present-perfect': 25,
  modals: 30,
  'mixed-tenses': 25,
  'simple-past': 28,
};

const MIN_VOCAB: Record<Exclude<VocabTopic, 'own'>, number> = {
  feelings: 20,
  'plans-jobs': 15,
  weather: 15,
  'town-places': 15,
  adjectives: 20,
  history: 20,
  'travel-sights': 15,
  health: 15,
  'rules-permission': 10,
};

const allItems = grammarTopics.flatMap((t) => t.items);

describe('grammar data', () => {
  it('has all topics in plan order', () => {
    expect(grammarTopics.map((t) => t.id)).toEqual([
      'simple-present', 'present-progressive', 'going-to', 'timetable-future', 'will', 'going-to-vs-will', 'comparison',
      'simple-past', 'past-progressive', 'present-perfect', 'irregular-verbs', 'modals', 'mixed-tenses',
    ]);
  });

  it('has unique item ids', () => {
    expect(new Set(allItems.map((i) => i.id)).size).toBe(allItems.length);
  });

  it.each(allItems.map((i) => [i.id, i] as const))('%s is well-formed and self-consistent', (_, item) => {
    expect(item.explanation.trim()).not.toBe('');
    if (item.kind === 'choice') {
      expect(item.correctIndex).toBeGreaterThanOrEqual(0);
      expect(item.correctIndex).toBeLessThan(item.options.length);
      return;
    }
    expect(item.answers.length).toBeGreaterThan(0);
    if (item.kind === 'gap') expect(item.prompt.split('___').length).toBe(2);
    expect(checkItem(item, item.answers[0]).status).toBe('correct');
  });

  it.each(Object.entries(MIN_ITEMS))('%s meets the minimum count and mix', (id, min) => {
    const topic = grammarTopics.find((t) => t.id === id)!;
    const count = (k: string) => topic.items.filter((i) => i.kind === k).length;
    const n = topic.items.length;
    expect(n).toBeGreaterThanOrEqual(min);
    expect(count('gap') / n).toBeGreaterThanOrEqual(0.6);
    expect(count('choice') / n).toBeGreaterThanOrEqual(0.2);
    if (id === 'mixed-tenses') expect(count('write')).toBe(0);
    else expect(count('write')).toBeGreaterThanOrEqual(4);
  });

  it('irregular verbs list is complete', () => {
    expect(irregularVerbs.length).toBe(53);
    expect(new Set(irregularVerbs.map((v) => v.base)).size).toBe(53);
    const topic = grammarTopics.find((t) => t.id === 'irregular-verbs')!;
    expect(topic.items.length).toBe(106);
  });
});

describe('vocab and mediation data', () => {
  it('has unique vocab ids', () => {
    expect(new Set(starterVocab.map((v) => v.id)).size).toBe(starterVocab.length);
  });

  it.each(Object.entries(MIN_VOCAB))('topic %s has at least %i entries', (topic, min) => {
    expect(starterVocab.filter((v) => v.topic === topic).length).toBeGreaterThanOrEqual(min);
  });

  it('has at least 10 mediation items per workshop with answers', () => {
    expect(new Set(mediationItems.map((m) => m.id)).size).toBe(mediationItems.length);
    for (const ws of ['W1', 'W2'] as const) {
      expect(mediationItems.filter((m) => m.workshop === ws).length).toBeGreaterThanOrEqual(10);
    }
    for (const m of mediationItems) expect(m.answers.length).toBeGreaterThan(0);
  });
});
