export type Grade = 1 | 2 | 3 | 4 | 5 | 6;

/** Guideline key; adjust here if the teacher's key is known. */
export function gradeFromPercent(p: number): Grade {
  if (p >= 87.5) return 1;
  if (p >= 75) return 2;
  if (p >= 62.5) return 3;
  if (p >= 50) return 4;
  if (p >= 25) return 5;
  return 6;
}
