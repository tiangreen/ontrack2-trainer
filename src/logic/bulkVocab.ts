import type { VocabEntry, WorkshopId } from '../types';
import { normalize } from './answers';

const SEPARATORS = ['\t', ';', ' = ', ' - '];

export interface BulkVocabResult {
  added: VocabEntry[];
  duplicates: number;
  errors: { line: number; text: string }[];
}

/** Parses one "english<sep>german" pair per line; separators tried in order. */
export function parseBulkVocab(text: string, existing: VocabEntry[], workshop: WorkshopId): BulkVocabResult {
  const result: BulkVocabResult = { added: [], duplicates: 0, errors: [] };
  const seen = new Set(existing.map((e) => `${normalize(e.en)}|${normalize(e.de)}`));
  const stamp = Date.now().toString(36);
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    const sep = SEPARATORS.find((s) => line.includes(s));
    const pos = sep ? line.indexOf(sep) : -1;
    const en = sep ? line.slice(0, pos).trim() : '';
    const de = sep ? line.slice(pos + sep.length).trim() : '';
    if (!en || !de) {
      result.errors.push({ line: i + 1, text: line });
      return;
    }
    const key = `${normalize(en)}|${normalize(de)}`;
    if (seen.has(key)) {
      result.duplicates++;
      return;
    }
    seen.add(key);
    result.added.push({ id: `own-${stamp}-${i}`, en, de, workshop, topic: 'own' });
  });
  return result;
}
