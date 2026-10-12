import { expect, it } from 'vitest';
import { parseBulkVocab } from './bulkVocab';

it('parses lines, skips blanks and duplicates, reports invalid lines', () => {
  const text = 'to be scared; Angst haben\n\nfoo\ncastle\tdie Burg\nto be scared;Angst haben';
  const r = parseBulkVocab(text, [], 'W2');
  expect(r.added.map((e) => [e.en, e.de, e.workshop, e.topic])).toEqual([
    ['to be scared', 'Angst haben', 'W2', 'own'],
    ['castle', 'die Burg', 'W2', 'own'],
  ]);
  expect(r.duplicates).toBe(1);
  expect(r.errors).toEqual([{ line: 3, text: 'foo' }]);
  expect(new Set(r.added.map((e) => e.id)).size).toBe(2);
});

it('treats existing entries as duplicates and rejects empty sides', () => {
  const existing = [{ id: 'x', en: 'Castle', de: 'die Burg', workshop: 'W1' as const, topic: 'own' as const }];
  const r = parseBulkVocab('castle = die Burg\nking - \n - König\nqueen - die Königin', existing, 'W1');
  expect(r.added.map((e) => e.en)).toEqual(['queen']);
  expect(r.duplicates).toBe(1);
  expect(r.errors.map((e) => e.line)).toEqual([2, 3]);
});
