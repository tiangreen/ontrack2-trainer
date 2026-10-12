import { useMemo, useState, type FormEvent } from 'react';
import { starterVocab } from '../data/vocab';
import { checkVocab } from '../logic/answers';
import { mulberry32, shuffle } from '../logic/random';
import { useAppState } from '../state';
import type { CheckResult, VocabEntry, VocabTopic, WorkshopId } from '../types';
import { Feedback } from './Feedback';
import { SpeakButton } from './SpeakButton';

type Mode = 'cards' | 'de-en' | 'en-de' | 'choice';

const MODES: { id: Mode; label: string }[] = [
  { id: 'cards', label: 'Karteikarten (EN → DE)' },
  { id: 'de-en', label: 'Tippen Deutsch → Englisch' },
  { id: 'en-de', label: 'Tippen Englisch → Deutsch' },
  { id: 'choice', label: 'Auswahl (EN → DE)' },
];

const TOPICS: { id: VocabTopic; label: string; ws?: WorkshopId }[] = [
  { id: 'feelings', label: 'Gefühle', ws: 'W1' },
  { id: 'plans-jobs', label: 'Pläne & Berufe', ws: 'W1' },
  { id: 'weather', label: 'Wetter', ws: 'W1' },
  { id: 'town-places', label: 'Orte in der Stadt', ws: 'W1' },
  { id: 'adjectives', label: 'Adjektive', ws: 'W1' },
  { id: 'history', label: 'Geschichte', ws: 'W2' },
  { id: 'travel-sights', label: 'Reisen & Sehenswürdigkeiten', ws: 'W2' },
  { id: 'health', label: 'Gesundheit', ws: 'W2' },
  { id: 'rules-permission', label: 'Regeln & Erlaubnis', ws: 'W2' },
  { id: 'own', label: 'Eigene Wörter' },
];

interface Answer {
  entry: VocabEntry;
  given: string;
  right: boolean;
}

type Phase = { name: 'setup' } | { name: 'running'; words: VocabEntry[] } | { name: 'done'; log: Answer[] };

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function VocabTrainer() {
  const { state, recordVocab } = useAppState();
  const [workshops, setWorkshops] = useState<WorkshopId[]>(['W1', 'W2']);
  const [topics, setTopics] = useState<VocabTopic[]>(TOPICS.map((t) => t.id));
  const [hardOnly, setHardOnly] = useState(false);
  const [length, setLength] = useState(10);
  const [mode, setMode] = useState<Mode>('de-en');
  const [phase, setPhase] = useState<Phase>({ name: 'setup' });
  const [round, setRound] = useState(0);

  const allVocab = useMemo(() => [...starterVocab, ...state.ownVocab], [state.ownVocab]);
  const pool = allVocab.filter(
    (v) =>
      workshops.includes(v.workshop) &&
      topics.includes(v.topic) &&
      (!hardOnly || state.vocabStats[v.id]?.last === 'wrong'),
  );

  const startWith = (words: VocabEntry[]) => {
    setRound((r) => r + 1);
    setPhase({ name: 'running', words });
  };

  if (phase.name === 'running') {
    return (
      <VocabRound
        key={round}
        words={phase.words}
        mode={mode}
        allVocab={allVocab}
        onAnswer={recordVocab}
        onDone={(log) => setPhase({ name: 'done', log })}
        onCancel={() => setPhase({ name: 'setup' })}
      />
    );
  }

  if (phase.name === 'done') {
    const { log } = phase;
    const right = log.filter((a) => a.right).length;
    const mistakes = log.filter((a) => !a.right);
    return (
      <section className="card">
        <h1>Runde geschafft</h1>
        <p className="score">
          {right} von {log.length} richtig – <strong>{Math.round((right / log.length) * 100)} %</strong>
        </p>
        {mistakes.length > 0 ? (
          <>
            <h2>Diese Wörter übst du nochmal</h2>
            <ul className="mistakes">
              {mistakes.map((m) => (
                <li key={m.entry.id}>
                  <strong lang="en">{m.entry.en}</strong> <SpeakButton text={m.entry.en} /> – {m.entry.de}
                  {m.given && (
                    <div>
                      Deine Antwort: <span className="bad-text">{m.given}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <button type="button" className="primary" onClick={() => startWith(shuffle(mistakes.map((m) => m.entry), mulberry32(Date.now())))}>
              Fehler nochmal üben
            </button>
          </>
        ) : (
          <p>Alles gewusst – klasse! 🎉</p>
        )}
        <button type="button" onClick={() => setPhase({ name: 'setup' })}>
          Neue Runde einstellen
        </button>
      </section>
    );
  }

  return (
    <>
      <h1>Vokabeltrainer</h1>
      <p className="notice">
        Startliste passend zu den Workshop-Themen – nicht identisch mit der Wortliste im Buch. Trage die Buch-Vokabeln
        unter <a href="#/vokabeln/eigene">‚Eigene Wörter‘</a> ein.
      </p>
      <section className="card settings">
        <fieldset>
          <legend>Workshop</legend>
          {(['W1', 'W2'] as const).map((ws) => (
            <label key={ws} className="check">
              <input type="checkbox" checked={workshops.includes(ws)} onChange={() => setWorkshops(toggle(workshops, ws))} />
              Workshop {ws.slice(1)}
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>Themen</legend>
          <div className="check-grid">
            {TOPICS.filter((t) => !t.ws || workshops.includes(t.ws)).map((t) => (
              <label key={t.id} className="check">
                <input type="checkbox" checked={topics.includes(t.id)} onChange={() => setTopics(toggle(topics, t.id))} />
                {t.label}
                {t.id === 'own' && ` (${state.ownVocab.length})`}
              </label>
            ))}
          </div>
          <div className="row">
            <button type="button" onClick={() => setTopics(TOPICS.map((t) => t.id))}>
              Alle
            </button>
            <button type="button" onClick={() => setTopics([])}>
              Keine
            </button>
          </div>
        </fieldset>
        <fieldset>
          <legend>Auswahl</legend>
          <label className="check">
            <input type="checkbox" checked={hardOnly} onChange={(e) => setHardOnly(e.target.checked)} />
            Nur schwierige Wörter (zuletzt falsch)
          </label>
          <label className="check">
            Rundenlänge
            <select value={length} onChange={(e) => setLength(Number(e.target.value))}>
              <option value={10}>10 Wörter</option>
              <option value={20}>20 Wörter</option>
            </select>
          </label>
        </fieldset>
        <fieldset>
          <legend>Modus</legend>
          {MODES.map((m) => (
            <label key={m.id} className="check">
              <input type="radio" name="mode" checked={mode === m.id} onChange={() => setMode(m.id)} />
              {m.label}
            </label>
          ))}
        </fieldset>
        {pool.length === 0 ? (
          <p className="bad-text">Keine Wörter für diese Auswahl.</p>
        ) : (
          <p>{pool.length} Wörter in der Auswahl.</p>
        )}
        <button
          type="button"
          className="primary"
          disabled={pool.length === 0}
          onClick={() => startWith(shuffle(pool, mulberry32(Date.now())).slice(0, length))}
        >
          Los geht's
        </button>
      </section>
    </>
  );
}

interface RoundProps {
  words: VocabEntry[];
  mode: Mode;
  allVocab: VocabEntry[];
  onAnswer(id: string, right: boolean): void;
  onDone(log: Answer[]): void;
  onCancel(): void;
}

function VocabRound({ words, mode, allVocab, onAnswer, onDone, onCancel }: RoundProps) {
  const [index, setIndex] = useState(0);
  const [log, setLog] = useState<Answer[]>([]);
  const [text, setText] = useState('');
  const [result, setResult] = useState<CheckResult | null>(null);
  const [flipped, setFlipped] = useState(false);
  const entry = words[index];
  const [seed] = useState(() => Date.now());

  const options = useMemo(() => {
    if (mode !== 'choice') return [];
    const rng = mulberry32(seed + index);
    const others = allVocab.filter((v) => v.de !== entry.de);
    const sameTopic = shuffle(others.filter((v) => v.topic === entry.topic), rng);
    const rest = shuffle(others.filter((v) => v.topic !== entry.topic), rng);
    const distractors: string[] = [];
    for (const v of [...sameTopic, ...rest]) {
      if (distractors.length === 3) break;
      if (!distractors.includes(v.de)) distractors.push(v.de);
    }
    return shuffle([entry.de, ...distractors], rng);
  }, [mode, index, entry, allVocab, seed]);

  const answer = (given: string, right: boolean) => {
    onAnswer(entry.id, right);
    const nextLog = [...log, { entry, given, right }];
    setLog(nextLog);
    return nextLog;
  };

  // cards mode answers and advances in one handler, so it passes the fresh log
  const next = (currentLog = log) => {
    if (index + 1 >= words.length) {
      onDone(currentLog);
      return;
    }
    setIndex(index + 1);
    setText('');
    setResult(null);
    setFlipped(false);
  };

  const checkTyped = () => {
    const r = checkVocab(entry, text, mode === 'de-en' ? 'de-en' : 'en-de');
    setResult(r);
    answer(text, r.status === 'correct');
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (result) next();
    else if (text.trim()) checkTyped();
  };

  const choose = (opt: string) => {
    if (result) return;
    const right = opt === entry.de;
    setResult({ status: right ? 'correct' : 'wrong', expected: entry.de });
    setText(opt);
    answer(opt, right);
  };

  const english = (
    <span className="word" lang="en">
      {entry.en} <SpeakButton text={entry.en} />
    </span>
  );

  return (
    <section className="card vocab-round">
      <div className="progress-line">
        Wort {index + 1} von {words.length}
        <button type="button" className="link" onClick={onCancel}>
          Abbrechen
        </button>
      </div>

      {mode === 'cards' && (
        <div className="flashcard">
          <div className="front">{english}</div>
          {flipped ? (
            <>
              <div className="back">{entry.de}</div>
              {entry.example && <p className="example" lang="en">„{entry.example}“</p>}
              <div className="row">
                <button type="button" className="ok-btn" onClick={() => next(answer('', true))}>
                  ✔ Gewusst
                </button>
                <button type="button" className="bad-btn" onClick={() => next(answer('', false))}>
                  ✘ Nicht gewusst
                </button>
              </div>
            </>
          ) : (
            <button type="button" className="primary" autoFocus onClick={() => setFlipped(true)}>
              Umdrehen
            </button>
          )}
        </div>
      )}

      {(mode === 'de-en' || mode === 'en-de') && (
        <form onSubmit={submit}>
          <p className="prompt-word">{mode === 'de-en' ? entry.de : english}</p>
          <input
            key={entry.id}
            className={`answer-input ${result?.status ?? ''}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            readOnly={!!result}
            autoFocus
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder={mode === 'de-en' ? 'auf Englisch …' : 'auf Deutsch …'}
            aria-label="Deine Antwort"
          />
          {result && (
            <Feedback status={result.status} expected={result.expected} explanation={entry.example}>
              {mode === 'de-en' && <SpeakButton text={entry.en} />}
            </Feedback>
          )}
          <div className="actions">
            <button type="submit" className="primary" disabled={!result && !text.trim()}>
              {result ? 'Weiter ⏎' : 'Prüfen ⏎'}
            </button>
          </div>
        </form>
      )}

      {mode === 'choice' && (
        <>
          <p className="prompt-word">{english}</p>
          <div className="choices">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`choice ${result ? (opt === entry.de ? 'correct' : opt === text ? 'wrong' : '') : ''}`}
                onClick={() => choose(opt)}
                disabled={!!result}
              >
                {opt}
              </button>
            ))}
          </div>
          {result && (
            <>
              <Feedback status={result.status} expected={result.expected} explanation={entry.example} />
              <div className="actions">
                <button type="button" className="primary" autoFocus onClick={() => next()}>
                  Weiter ⏎
                </button>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
