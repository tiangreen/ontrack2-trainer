import { expect, it } from 'vitest';
import { gradeFromPercent } from './grading';

it.each([
  [100, 1],
  [87.5, 1],
  [87.4, 2],
  [75, 2],
  [62.5, 3],
  [50, 4],
  [49.9, 5],
  [25, 5],
  [24.9, 6],
  [0, 6],
])('%s %% → Note %s', (p, grade) => {
  expect(gradeFromPercent(p)).toBe(grade);
});
