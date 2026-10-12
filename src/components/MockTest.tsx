import { useEffect, useMemo, useState } from 'react';
import { starterVocab } from '../data/vocab';
import { checkItem, checkVocab, normalize } from '../logic/answers';
import { gradeFromPercent } from '../logic/grading';
import { buildMockTest, type MockQuestion } from '../logic/mockTest';
import { mulberry32 } from '../logic/random';
import { useAppState } from '../state';
import type { WorkshopId } from '../types';

const DURATION_S = 20 * 60;

const SECTIONS = [
  { id: 'A', title: 'A Vocabulary', task: 'Übersetze ins Englische.' },
  { id: 'B', title: 'B Grammar', task: 'Setze die richtige Form ein bzw. wähle die richtige Lösung.' },
  { id: 'C', title: 'C Sentences', task: 'Bearbeite die Sätze wie angegeben.' },
  { id: 'D', title: 'D Mediation', task: 'Sag es auf Englisch.' },
] as const;

type Answers = Record<number, string | number>;

type Phase =
  | { name: 'setup' }
  | { name: 'running'; questions: MockQuestion[]; deadline: number }
  | { name: 'review'; questions: MockQuestion[]; answers: Answers };

export function MockTest() {
  const [workshops, setWorkshops] = useState<WorkshopId[]>(['W1', 'W2']);
  const [phase, setPhase] = useState<Phase>({ name: 'setup' });
  const { state } = useAppState();

  if (phase.name === 'running') {
    return (
      <RunningTest
        questions={phase.questions}
        deadline={phase.deadline}
        onSubmit={(answers) => {
          setPhase({ name: 'review', questions: phase.questions, answers });
          window.scrollTo(0, 0);
        }}
      />
    );
  }

  if (phase.name === 'review') {
    return (
      <Review
        questions={phase.questions}
        answers={phase.answers}
        workshops={workshops}
        onRestart={() => setPhase({ name: 'setup' })}
      />
    );
  }

  const start = () => {
    const questions = buildMockTest(workshops, [...starterVocab, ...state.ownVocab], mulberry32(Date.now()));
    setPhase({ name: 'running', questions, deadline: Date.now() + DURATION_S * 1000 });
  };

  return (
    <>
      <h1>Probe-Leistungsnachweis</h1>
      <section className="card">
        <fieldset>
          <legend>Welcher Stoff?</legend>
          {(['W1', 'W2'] as const).map((ws) => (
            <label key={ws} className="check">
              <input
                type="checkbox"
                checked={workshops.includes(ws)}
                onChange={() =>
                  setWorkshops(workshops.includes(ws) ? workshops.filter((w) => w !== ws) : [...workshops, ws].sort())
                }
              />
              Workshop {ws.slice(1)}
            </label>
          ))}
        </fieldset>
        <p className="notice">8 Vokabeln, 12 Grammatik, 3 Sätze, 2 Mediation – 20 Minuten</p>
        <p>Arbeite ohne Hilfe – wie im echten Test. Die Lösungen siehst du erst nach dem Abgeben.</p>
        <button type="button" className="primary" disabled={workshops.length === 0} onClick={start}>
          Probetest starten
        </button>
      </section>
    </>
  );
}

function questionLabel(q: MockQuestion): string {
  switch (q.type) {
    case 'vocab':
      return q.entry.de;
    case 'mediation':
      return `${q.item.situation} „${q.item.de}“`;
    case 'item':
      return q.item.kind === 'write' ? `${q.item.instruction} ${q.item.prompt}` : q.item.prompt;
  }
}

function RunningTest({ questions, deadline, onSubmit }: { questions: MockQuestion[]; deadline: number; onSubmit(a: Answers): void }) {
  const [answers, setAnswers] = useState<Answers>({});
  const [now, setNow] = useState(() => Date.now());
  const remaining = Math.max(0, Math.ceil((deadline - now) / 1000));

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(t);
  }, []);

  const timeUp = remaining === 0;
  useEffect(() => {
    if (timeUp) onSubmit(answers);
    // submit exactly once when the timer hits zero
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeUp]);

  const set = (i: number, v: string | number) => setAnswers((a) => ({ ...a, [i]: v }));
  const empty = questions.filter((_, i) => answers[i] === undefined || String(answers[i]).trim() === '').length;

  const submit = () => {
    if (empty > 0 && !window.confirm(`${empty} Aufgabe(n) sind noch leer. Trotzdem abgeben?`)) return;
    onSubmit(answers);
  };

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  return (
    <>
      <div className={`timer ${remaining <= 120 ? 'urgent' : ''}`} role="timer" aria-live="off">
        ⏱ {mm}:{ss}
        <span className="timer-info">{questions.length - empty} von {questions.length} bearbeitet</span>
      </div>
      <h1>Probe-Leistungsnachweis</h1>
      {SECTIONS.map((sec) => {
        const qs = questions.map((q, i) => ({ q, i })).filter(({ q }) => q.section === sec.id);
        if (qs.length === 0) return null;
        const points = qs.reduce((s, { q }) => s + q.points, 0);
        return (
          <section key={sec.id} className="card test-section">
            <h2>
              {sec.title} <small>({points} P.)</small>
            </h2>
            <p className="task">{sec.task}</p>
            <ol>
              {qs.map(({ q, i }) => (
                <li key={i}>
                  <QuestionInput q={q} value={answers[i]} onChange={(v) => set(i, v)} />
                  <span className="points">{q.points} P.</span>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
      <button type="button" className="primary big" onClick={submit}>
        Abgeben
      </button>
    </>
  );
}

function QuestionInput({ q, value, onChange }: { q: MockQuestion; value: string | number | undefined; onChange(v: string | number): void }) {
  const text = typeof value === 'string' ? value : '';
  const inputProps = { autoComplete: 'off', autoCapitalize: 'off', spellCheck: false } as const;
  if (q.type === 'vocab') {
    return (
      <label className="test-q">
        <span>{q.entry.de}</span>
        <input value={text} onChange={(e) => onChange(e.target.value)} {...inputProps} lang="en" />
      </label>
    );
  }
  if (q.type === 'mediation') {
    return (
      <div className="test-q">
        <p>{q.item.situation}</p>
        <p className="de-quote">„{q.item.de}“</p>
        <textarea value={text} onChange={(e) => onChange(e.target.value)} rows={2} {...inputProps} lang="en" aria-label="Deine Antwort" />
      </div>
    );
  }
  const item = q.item;
  if (item.kind === 'gap') {
    const [before, after] = item.prompt.split('___');
    return (
      <p className="gap-sentence test-q">
        {before}
        <input className="gap-input" value={text} onChange={(e) => onChange(e.target.value)} {...inputProps} aria-label="Lücke" />
        {after}
        {item.hint && <span className="hint"> {item.hint}</span>}
      </p>
    );
  }
  if (item.kind === 'choice') {
    return (
      <div className="test-q">
        <p className="gap-sentence">{item.prompt}</p>
        <div className="radio-row">
          {item.options.map((opt, oi) => (
            <label key={opt} className="check">
              <input type="radio" name={item.id} checked={value === oi} onChange={() => onChange(oi)} />
              {opt}
            </label>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="test-q">
      <p>
        <strong>{item.instruction}</strong> {item.prompt}
      </p>
      <textarea value={text} onChange={(e) => onChange(e.target.value)} rows={2} {...inputProps} lang="en" aria-label="Deine Antwort" />
    </div>
  );
}

interface Graded {
  q: MockQuestion;
  given: string;
  expected: string;
  explanation?: string;
  /** null = pupil must self-assess (C/D answers that did not match) */
  autoPoints: number | null;
}

function grade(q: MockQuestion, value: string | number | undefined): Graded {
  const given = q.type === 'item' && q.item.kind === 'choice' ? (typeof value === 'number' ? q.item.options[value] : '') : typeof value === 'string' ? value : '';
  const isEmpty = given.trim() === '';
  switch (q.section) {
    case 'A': {
      const r = checkVocab(q.entry, given, 'de-en');
      return { q, given, expected: r.expected, explanation: q.entry.example, autoPoints: r.status === 'correct' ? 1 : 0 };
    }
    case 'B': {
      const r = checkItem(q.item, value ?? '');
      return { q, given, expected: r.expected, explanation: q.item.explanation, autoPoints: r.status === 'correct' ? 1 : 0 };
    }
    case 'C': {
      const r = checkItem(q.item, given);
      const autoPoints = r.status === 'correct' ? 2 : isEmpty ? 0 : null;
      return { q, given, expected: r.expected, explanation: q.item.explanation, autoPoints };
    }
    case 'D': {
      const hit = !isEmpty && q.item.answers.some((a) => normalize(a) === normalize(given));
      return { q, given, expected: q.item.answers[0], autoPoints: hit ? 2 : isEmpty ? 0 : null };
    }
  }
}

function Review({ questions, answers, workshops, onRestart }: { questions: MockQuestion[]; answers: Answers; workshops: WorkshopId[]; onRestart(): void }) {
  const { addMockResult } = useAppState();
  const graded = useMemo(() => questions.map((q, i) => grade(q, answers[i])), [questions, answers]);
  const [selfPoints, setSelfPoints] = useState<Record<number, number>>({});
  const [computed, setComputed] = useState(false);

  const pending = graded.filter((g, i) => g.autoPoints === null && selfPoints[i] === undefined).length;
  const pointsOf = (i: number) => graded[i].autoPoints ?? selfPoints[i] ?? 0;
  const maxPoints = questions.reduce((s, q) => s + q.points, 0);
  const total = graded.reduce((s, _, i) => s + pointsOf(i), 0);
  const percent = maxPoints ? (total / maxPoints) * 100 : 0;
  const note = gradeFromPercent(percent);

  const compute = () => {
    if (computed || pending > 0) return;
    setComputed(true);
    addMockResult({ date: new Date().toISOString(), workshops, points: total, maxPoints, grade: note });
    window.scrollTo(0, 0);
  };

  return (
    <>
      <h1>Auswertung</h1>
      {computed ? (
        <section className="card result">
          <p className="score">
            {total} von {maxPoints} Punkten – {Math.round(percent)} %
          </p>
          <p className="grade">Note {note}</p>
          <p className="notice">Richtwert – jede Lehrkraft bewertet etwas anders.</p>
          <table className="table">
            <thead>
              <tr>
                <th>Teil</th>
                <th>Punkte</th>
              </tr>
            </thead>
            <tbody>
              {SECTIONS.map((sec) => {
                const idx = graded.map((g, i) => ({ g, i })).filter(({ g }) => g.q.section === sec.id);
                if (idx.length === 0) return null;
                return (
                  <tr key={sec.id}>
                    <td>{sec.title}</td>
                    <td>
                      {idx.reduce((s, { i }) => s + pointsOf(i), 0)} / {idx.reduce((s, { g }) => s + g.q.points, 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button type="button" className="primary" onClick={onRestart}>
            Neuen Probetest
          </button>
        </section>
      ) : (
        <section className="card">
          <p>
            Teil A und B wurden automatisch korrigiert. Bei Teil C und D kann es mehrere richtige Lösungen geben: Vergleiche
            deine Antwort mit der Musterlösung und bewerte dich ehrlich.
          </p>
          {pending > 0 && <p className="notice">Noch {pending} Selbstbewertung(en) offen.</p>}
          <button type="button" className="primary" disabled={pending > 0} onClick={compute}>
            Ergebnis berechnen
          </button>
        </section>
      )}

      {SECTIONS.map((sec) => {
        const items = graded.map((g, i) => ({ g, i })).filter(({ g }) => g.q.section === sec.id);
        if (items.length === 0) return null;
        return (
          <section key={sec.id} className="card test-section">
            <h2>{sec.title}</h2>
            <ol>
              {items.map(({ g, i }) => {
                const pts = graded[i].autoPoints ?? selfPoints[i];
                const status = pts === undefined ? '' : pts === g.q.points ? 'correct' : pts > 0 ? 'almost' : 'wrong';
                return (
                  <li key={i} className={`review-q ${status}`}>
                    <div className="q-label">{questionLabel(g.q)}</div>
                    <div>
                      Deine Antwort: <span className={status === 'correct' ? 'ok-text' : 'bad-text'}>{g.given || '—'}</span>
                    </div>
                    {status !== 'correct' && (
                      <div>
                        {g.q.section === 'C' || g.q.section === 'D' ? 'Musterlösung' : 'Lösung'}: <strong>{g.expected}</strong>
                      </div>
                    )}
                    {g.explanation && <div className="explanation">{g.explanation}</div>}
                    {g.autoPoints === null && !computed && (
                      <div className="row self-assess">
                        {[
                          [2, 'richtig (2)'],
                          [1, 'kleiner Fehler (1)'],
                          [0, 'falsch (0)'],
                        ].map(([p, label]) => (
                          <button
                            key={p}
                            type="button"
                            className={selfPoints[i] === p ? 'selected' : undefined}
                            onClick={() => setSelfPoints({ ...selfPoints, [i]: p as number })}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="points">
                      {pts ?? '?'} / {g.q.points} P.
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </>
  );
}
