import { grammarTopics } from '../data/grammar';
import { useAppState } from '../state';
import type { WorkshopId } from '../types';

const WORKSHOPS: { id: WorkshopId; title: string }[] = [
  { id: 'W1', title: 'Workshop 1 – Gegenwart, Zukunft und Steigerung' },
  { id: 'W2', title: 'Workshop 2 – Vergangenheit, present perfect und modal verbs' },
];

export function GrammarList() {
  const { state } = useAppState();
  return (
    <>
      <h1>Grammatik</h1>
      {WORKSHOPS.map((ws) => (
        <section key={ws.id}>
          <h2>{ws.title}</h2>
          <ul className="topic-list">
            {grammarTopics
              .filter((t) => t.workshop === ws.id)
              .map((t) => {
                const stat = state.topicStats[t.id];
                return (
                  <li key={t.id}>
                    <a href={`#/grammatik/${t.id}`} className="topic-link">
                      <span>
                        <strong>{t.titleDe}</strong>
                        <small>{t.title}</small>
                      </span>
                      <span className="topic-stat">
                        {stat ? `zuletzt ${stat.lastPercent} % · best ${stat.bestPercent} %` : 'noch nicht geübt'}
                      </span>
                    </a>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </>
  );
}
