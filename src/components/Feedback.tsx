import type { ReactNode } from 'react';
import type { CheckStatus } from '../types';

const LABEL: Record<CheckStatus, string> = {
  correct: '✔ Richtig!',
  almost: '≈ Fast! Achte auf die Schreibweise.',
  wrong: '✘ Leider falsch.',
};

interface Props {
  status: CheckStatus;
  expected: string;
  explanation?: string;
  children?: ReactNode;
}

/** Shared green/orange/red result box. `almost` counts as wrong everywhere. */
export function Feedback({ status, expected, explanation, children }: Props) {
  return (
    <div className={`feedback ${status}`} role="status">
      <strong>{LABEL[status]}</strong>
      {status !== 'correct' && (
        <div>
          Lösung: <strong>{expected}</strong>
        </div>
      )}
      {explanation && <div className="explanation">{explanation}</div>}
      {children}
    </div>
  );
}
