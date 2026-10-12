import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { checkItem } from '../logic/answers';
import type { CheckResult, ExerciseItem } from '../types';
import { Feedback } from './Feedback';

interface Answered {
  item: ExerciseItem;
  given: string;
  correct: boolean;
  expected: string;
}

interface Props {
  items: ExerciseItem[];
  /** Called once with the score of the first round (not for repeat rounds). */
  onFinish(percent: number): void;
  onNewRound?: () => void;
}

export function ExerciseRunner({ items, onFinish, onNewRound }: Props) {
  const [round, setRound] = useState(items);
  const [isRepeat, setIsRepeat] = useState(false);
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [result, setResult] = useState<CheckResult | null>(null);
  const [given, setGiven] = useState('');
  const [overridden, setOverridden] = useState(false);
  const [log, setLog] = useState<Answered[]>([]);

  if (round.length === 0) return <p>Keine Aufgaben vorhanden.</p>;

  const done = index >= round.length;
  if (done) {
    const right = log.filter((a) => a.correct).length;
    const percent = Math.round((right / log.length) * 100);
    const mistakes = log.filter((a) => !a.correct);
    const restart = (next: ExerciseItem[]) => {
      setRound(next);
      setIsRepeat(true);
      setIndex(0);
      setLog([]);
    };
    return (
      <section className="card">
        <h2>{isRepeat ? 'Wiederholung geschafft' : 'Runde geschafft'}</h2>
        <p className="score">
          {right} von {log.length} richtig – <strong>{percent} %</strong>
        </p>
        {mistakes.length > 0 ? (
          <>
            <h3>Deine Fehler</h3>
            <ul className="mistakes">
              {mistakes.map((m) => (
                <li key={m.item.id}>
                  <div>{m.item.prompt}</div>
                  <div>
                    Deine Antwort: <span className="bad-text">{m.given || '—'}</span>
                  </div>
                  <div>
                    Lösung: <span className="ok-text">{m.expected}</span>
                  </div>
                </li>
              ))}
            </ul>
            <button type="button" className="primary" onClick={() => restart(mistakes.map((m) => m.item))}>
              Fehler wiederholen
            </button>
          </>
        ) : (
          <p>Alles richtig – super! 🎉</p>
        )}
        {onNewRound && (
          <button type="button" onClick={onNewRound}>
            Neue Runde
          </button>
        )}
      </section>
    );
  }

  const item = round[index];

  const check = (input: string | number) => {
    if (result) return;
    const r = checkItem(item, input);
    setResult(r);
    setGiven(typeof input === 'number' && item.kind === 'choice' ? item.options[input] : String(input));
  };

  const next = () => {
    if (!result) return;
    const entry = { item, given, correct: result.status === 'correct' || overridden, expected: result.expected };
    const nextLog = [...log, entry];
    setLog(nextLog);
    setIndex(index + 1);
    setText('');
    setResult(null);
    setOverridden(false);
    if (index + 1 >= round.length && !isRepeat) {
      onFinish(Math.round((nextLog.filter((a) => a.correct).length / nextLog.length) * 100));
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (result) next();
    else if (text.trim()) check(text);
  };

  const onTextareaKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) submit(e);
  };

  const status = overridden ? 'correct' : result?.status;

  return (
    <section className="card exercise">
      <div className="progress-line">
        Aufgabe {index + 1} von {round.length}
        {isRepeat && ' (Wiederholung)'}
      </div>
      <form onSubmit={submit}>
        {item.kind === 'gap' && (
          <p className="gap-sentence">
            {item.prompt.split('___')[0]}
            <input
              key={item.id}
              className={`gap-input ${status ?? ''}`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              readOnly={!!result}
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-label="Lücke"
            />
            {item.prompt.split('___')[1]}
            {item.hint && <span className="hint"> {item.hint}</span>}
          </p>
        )}
        {item.kind === 'choice' && (
          <>
            <p className="gap-sentence">{item.prompt}</p>
            <div className="choices">
              {item.options.map((opt, i) => {
                const cls = result
                  ? i === item.correctIndex
                    ? 'correct'
                    : given === opt
                      ? 'wrong'
                      : ''
                  : '';
                return (
                  <button key={opt} type="button" className={`choice ${cls}`} onClick={() => check(i)} disabled={!!result}>
                    {opt}
                  </button>
                );
              })}
            </div>
          </>
        )}
        {item.kind === 'write' && (
          <>
            <p>
              <strong>{item.instruction}</strong>
            </p>
            <p className="gap-sentence">{item.prompt}</p>
            <textarea
              key={item.id}
              className={status ?? ''}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onTextareaKey}
              readOnly={!!result}
              autoFocus
              rows={2}
              autoCapitalize="off"
              spellCheck={false}
              aria-label="Deine Antwort"
            />
          </>
        )}

        {result && status && (
          <Feedback status={status} expected={result.expected} explanation={item.explanation}>
            {item.kind === 'write' && result.status === 'wrong' && !overridden && (
              <button type="button" onClick={() => setOverridden(true)}>
                Meine Antwort war auch richtig
              </button>
            )}
          </Feedback>
        )}

        <div className="actions">
          {result ? (
            <button type="submit" className="primary" autoFocus={item.kind === 'choice'}>
              Weiter ⏎
            </button>
          ) : (
            item.kind !== 'choice' && (
              <button type="submit" className="primary" disabled={!text.trim()}>
                Prüfen ⏎
              </button>
            )
          )}
        </div>
      </form>
    </section>
  );
}
