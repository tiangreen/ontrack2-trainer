import type { CheckResult, ExerciseItem, VocabEntry } from '../types';

const CONTRACTIONS: [RegExp, string][] = [
  [/\bwon't\b/g, 'will not'],
  [/\bcan't\b/g, 'cannot'],
  [/\bcan not\b/g, 'cannot'],
  [/n't\b/g, ' not'],
  [/'m\b/g, ' am'],
  [/'re\b/g, ' are'],
  [/'ve\b/g, ' have'],
  [/'ll\b/g, ' will'],
];

/**
 * Canonical form for comparing answers. `'s` and `'d` stay unexpanded because
 * they are ambiguous (is/has, had/would) – content must list both variants.
 */
export function normalize(s: string): string {
  let t = s.normalize('NFC').replace(/[’‘´`]/g, "'").toLowerCase();
  t = t.replace(/,/g, '');
  t = t.replace(/\s+/g, ' ').trim();
  t = t.replace(/^["']+/, '').replace(/["'.!?]+$/, '').trim();
  for (const [re, repl] of CONTRACTIONS) t = t.replace(re, repl);
  return t.replace(/\s+/g, ' ').trim();
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  let cur = new Array<number>(b.length + 1);
  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, cur] = [cur, prev];
  }
  return prev[b.length];
}

function rate(input: string, targets: Iterable<string>, allowAlmost: boolean): CheckResult['status'] {
  if (!input) return 'wrong';
  let best = Infinity;
  for (const t of targets) {
    if (t === input) return 'correct';
    if (allowAlmost) best = Math.min(best, levenshtein(input, t));
  }
  return allowAlmost && best <= 1 && input.length >= 4 ? 'almost' : 'wrong';
}

export function checkItem(item: ExerciseItem, input: string | number): CheckResult {
  if (item.kind === 'choice') {
    const expected = item.options[item.correctIndex];
    return { status: input === item.correctIndex ? 'correct' : 'wrong', expected };
  }
  const expected = item.answers[0];
  const norm = typeof input === 'string' ? normalize(input) : '';
  const status = rate(norm, item.answers.map(normalize), item.kind === 'gap');
  return { status, expected };
}

export type VocabDirection = 'de-en' | 'en-de';

export function checkVocab(entry: VocabEntry, input: string, direction: VocabDirection): CheckResult {
  const expected = direction === 'de-en' ? entry.en : entry.de;
  // de-en: "to " before verbs optional; en-de: leading article optional
  const leading = direction === 'de-en' ? /^to / : /^(der|die|das|ein|eine) /;
  const targets = new Set<string>();
  for (const alt of expected.split(/[/;]/)) {
    const variants = [alt, alt.replace(/\([^)]*\)/g, ' '), alt.replace(/[()]/g, '')];
    for (const v of variants) {
      const n = normalize(v);
      if (!n) continue;
      targets.add(n);
      targets.add(n.replace(leading, ''));
    }
  }
  const norm = normalize(input).replace(leading, '');
  return { status: rate(norm, targets, true), expected };
}
