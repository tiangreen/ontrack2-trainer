import { useState } from 'react';
import { grammarTopics } from '../data/grammar';
import { mulberry32, shuffle } from '../logic/random';
import { useAppState } from '../state';
import type { GrammarTopic } from '../types';
import { ExerciseRunner } from './ExerciseRunner';

const ROUND_SIZE = 10;

const pickItems = (topic: GrammarTopic) => shuffle(topic.items, mulberry32(Date.now())).slice(0, ROUND_SIZE);

export function GrammarTopicPage({ topicId }: { topicId: string }) {
  const topic = grammarTopics.find((t) => t.id === topicId);
  const { recordTopic } = useAppState();
  const [round, setRound] = useState(() => (topic ? { n: 0, items: pickItems(topic) } : null));

  if (!topic || !round) {
    return (
      <section className="card">
        <h1>Thema nicht gefunden</h1>
        <p>
          Dieses Grammatik-Thema gibt es nicht. <a href="#/grammatik">Zur Grammatik-Übersicht</a>
        </p>
      </section>
    );
  }

  const { rule } = topic;
  return (
    <>
      <p>
        <a href="#/grammatik">← Alle Themen</a>
      </p>
      <h1>
        {topic.titleDe} <small className="subtitle">{topic.title}</small>
      </h1>
      <section className="card rule-card">
        <h2>Regelkarte</h2>
        <h3>So bildest du es</h3>
        <ul>
          {rule.form.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <h3>Wann benutzt du es?</h3>
        <ul>
          {rule.usage.map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>
        <h3>Signalwörter</h3>
        <p className="signal-words">
          {rule.signalWords.map((s) => (
            <span key={s} className="chip">
              {s}
            </span>
          ))}
        </p>
        <h3>Beispiele</h3>
        <ul className="examples">
          {rule.examples.map((ex) => (
            <li key={ex.en}>
              <span lang="en">{ex.en}</span>
              <span className="de">{ex.de}</span>
            </li>
          ))}
        </ul>
        <h3>Typische Fehler</h3>
        <ul className="pitfalls">
          {rule.pitfalls.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </section>

      <h2>Übung</h2>
      <ExerciseRunner
        key={round.n}
        items={round.items}
        onFinish={(percent) => recordTopic(topic.id, percent)}
        onNewRound={() => setRound({ n: round.n + 1, items: pickItems(topic) })}
      />
    </>
  );
}
