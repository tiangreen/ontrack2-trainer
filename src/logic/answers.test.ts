import { describe, expect, it } from 'vitest';
import type { ChoiceItem, GapItem, VocabEntry } from '../types';
import { checkItem, checkVocab } from './answers';

const gap = (answers: string[]): GapItem => ({ kind: 'gap', id: 'g', prompt: 'x ___', answers, explanation: '' });
const vocab = (en: string, de: string): VocabEntry => ({ id: 'v', en, de, workshop: 'W1', topic: 'own' });

describe('checkItem', () => {
  const visit = gap(['is going to visit']);

  it('ignores case and trailing punctuation', () => {
    expect(checkItem(visit, 'Is going to visit.').status).toBe('correct');
  });

  it('marks a single typo as almost', () => {
    expect(checkItem(visit, 'is goin to visit')).toEqual({ status: 'almost', expected: 'is going to visit' });
  });

  it('marks a wrong auxiliary as wrong', () => {
    expect(checkItem(visit, 'are going to visit').status).toBe('wrong');
  });

  it("expands won't and n't in both directions", () => {
    expect(checkItem(gap(["won't rain"]), 'will not rain').status).toBe('correct');
    expect(checkItem(gap(["didn't go"]), 'did not go').status).toBe('correct');
    expect(checkItem(gap(['did not go']), 'didn’t go').status).toBe('correct');
  });

  it('rejects empty input', () => {
    expect(checkItem(visit, '   ').status).toBe('wrong');
  });

  it('does not allow almost for short answers', () => {
    expect(checkItem(gap(['was']), 'wes').status).toBe('wrong');
  });

  it('checks choice by index', () => {
    const choice: ChoiceItem = { kind: 'choice', id: 'c', prompt: '', options: ['a', 'b'], correctIndex: 1, explanation: '' };
    expect(checkItem(choice, 0)).toEqual({ status: 'wrong', expected: 'b' });
    expect(checkItem(choice, 1).status).toBe('correct');
  });
});

describe('checkVocab', () => {
  it('accepts answers without "to" and with optional bracket content', () => {
    const e = vocab('to be afraid (of)', 'Angst haben (vor)');
    expect(checkVocab(e, 'be afraid of', 'de-en').status).toBe('correct');
    expect(checkVocab(e, 'to be afraid', 'de-en').status).toBe('correct');
  });

  it('accepts any alternative without article', () => {
    const e = vocab('castle', 'die Burg / das Schloss');
    expect(checkVocab(e, 'Schloss', 'en-de').status).toBe('correct');
    expect(checkVocab(e, 'die Burg', 'en-de').status).toBe('correct');
    expect(checkVocab(e, 'Haus', 'en-de').status).toBe('wrong');
  });

  it('marks a typo as almost', () => {
    expect(checkVocab(vocab('weather', 'das Wetter'), 'wether', 'de-en').status).toBe('almost');
  });

  it('rejects empty input', () => {
    expect(checkVocab(vocab('weather', 'das Wetter'), '', 'de-en').status).toBe('wrong');
  });
});
