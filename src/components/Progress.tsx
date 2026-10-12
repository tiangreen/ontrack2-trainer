import { grammarTopics } from '../data/grammar';
import { useAppState } from '../state';

export function Progress() {
  const { state, resetProgress } = useAppState();
  const vocabStats = Object.values(state.vocabStats);
  const known = vocabStats.filter((s) => s.last === 'right').length;
  const hard = vocabStats.length - known;

  const reset = () => {
    if (window.confirm('Wirklich den ganzen Fortschritt löschen? Deine eigenen Wörter bleiben erhalten.')) resetProgress();
  };

  return (
    <>
      <h1>Fortschritt</h1>

      <section className="card">
        <h2>Grammatik</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Thema</th>
              <th>Versuche</th>
              <th>Zuletzt</th>
              <th>Bestes</th>
            </tr>
          </thead>
          <tbody>
            {grammarTopics.map((t) => {
              const s = state.topicStats[t.id];
              return (
                <tr key={t.id}>
                  <td>
                    <a href={`#/grammatik/${t.id}`}>{t.titleDe}</a> <small>({t.workshop})</small>
                  </td>
                  <td>{s?.attempts ?? 0}</td>
                  <td>{s ? `${s.lastPercent} %` : '–'}</td>
                  <td>{s ? `${s.bestPercent} %` : '–'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2>Vokabeln</h2>
        <p>
          Zuletzt gewusst: <strong>{known}</strong> von <strong>{vocabStats.length}</strong> geübten Wörtern · schwierig:{' '}
          <strong>{hard}</strong>
        </p>
        {hard > 0 && (
          <p>
            Tipp: Im <a href="#/vokabeln">Vokabeltrainer</a> „Nur schwierige Wörter“ anhaken.
          </p>
        )}
      </section>

      <section className="card">
        <h2>Probetests</h2>
        {state.mockResults.length === 0 ? (
          <p>Noch kein Probetest geschrieben.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Workshops</th>
                <th>Punkte</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {[...state.mockResults].reverse().map((r) => (
                <tr key={r.date}>
                  <td>{new Date(r.date).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                  <td>{r.workshops.join(' + ')}</td>
                  <td>
                    {r.points} / {r.maxPoints}
                  </td>
                  <td>{r.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <button type="button" className="bad-btn" onClick={reset}>
        Fortschritt zurücksetzen
      </button>
    </>
  );
}
