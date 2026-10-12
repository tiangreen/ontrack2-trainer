import { useState, type FormEvent } from 'react';
import { parseBulkVocab } from '../logic/bulkVocab';
import { useAppState } from '../state';
import type { WorkshopId } from '../types';
import { SpeakButton } from './SpeakButton';

function WorkshopSelect({ value, onChange }: { value: WorkshopId; onChange(ws: WorkshopId): void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as WorkshopId)} aria-label="Workshop">
      <option value="W1">Workshop 1</option>
      <option value="W2">Workshop 2</option>
    </select>
  );
}

export function VocabEditor() {
  const { state, addOwnVocab, removeOwnVocab, clearOwnVocab } = useAppState();
  const [en, setEn] = useState('');
  const [de, setDe] = useState('');
  const [workshop, setWorkshop] = useState<WorkshopId>('W2');
  const [formError, setFormError] = useState('');
  const [bulk, setBulk] = useState('');
  const [bulkWorkshop, setBulkWorkshop] = useState<WorkshopId>('W2');
  const [bulkMessage, setBulkMessage] = useState('');

  const addSingle = (e: FormEvent) => {
    e.preventDefault();
    const { added, duplicates } = parseBulkVocab(`${en.trim()}\t${de.trim()}`, state.ownVocab, workshop);
    if (!en.trim() || !de.trim()) {
      setFormError('Bitte Englisch und Deutsch ausfüllen.');
      return;
    }
    if (duplicates) {
      setFormError('Dieses Wort steht schon in deiner Liste.');
      return;
    }
    addOwnVocab(added);
    setEn('');
    setDe('');
    setFormError('');
  };

  const importBulk = () => {
    const r = parseBulkVocab(bulk, state.ownVocab, bulkWorkshop);
    addOwnVocab(r.added);
    const lines = r.errors.map((e) => e.line).join(', ');
    setBulkMessage(
      `${r.added.length} hinzugefügt, ${r.duplicates} doppelt, ${r.errors.length} fehlerhaft` +
        (r.errors.length ? ` (Zeilen ${lines})` : ''),
    );
    // keep only the faulty lines so they can be corrected
    setBulk(r.errors.map((e) => e.text).join('\n'));
  };

  const clearAll = () => {
    if (window.confirm(`Wirklich alle ${state.ownVocab.length} eigenen Wörter löschen?`)) clearOwnVocab();
  };

  return (
    <>
      <p>
        <a href="#/vokabeln">← Zum Vokabeltrainer</a>
      </p>
      <h1>Eigene Wörter</h1>

      <section className="card">
        <h2>Ein Wort hinzufügen</h2>
        <form onSubmit={addSingle} className="add-form">
          <input value={en} onChange={(e) => setEn(e.target.value)} placeholder="Englisch, z. B. to be scared" aria-label="Englisch" lang="en" />
          <input value={de} onChange={(e) => setDe(e.target.value)} placeholder="Deutsch, z. B. Angst haben" aria-label="Deutsch" />
          <WorkshopSelect value={workshop} onChange={setWorkshop} />
          <button type="submit" className="primary">
            Hinzufügen
          </button>
        </form>
        {formError && <p className="bad-text">{formError}</p>}
      </section>

      <section className="card">
        <h2>Viele Wörter auf einmal einfügen</h2>
        <p>
          Eine Vokabel pro Zeile: erst Englisch, dann Deutsch – getrennt durch Tab, <code>;</code>, <code> = </code> oder{' '}
          <code> - </code>. Mehrere Bedeutungen trennst du mit <code>/</code>.
        </p>
        <textarea
          value={bulk}
          onChange={(e) => setBulk(e.target.value)}
          rows={8}
          placeholder={'to be scared; Angst haben\ncastle; die Burg / das Schloss'}
          aria-label="Vokabeln einfügen"
        />
        <div className="row">
          <WorkshopSelect value={bulkWorkshop} onChange={setBulkWorkshop} />
          <button type="button" className="primary" onClick={importBulk} disabled={!bulk.trim()}>
            Importieren
          </button>
        </div>
        {bulkMessage && <p className="notice">{bulkMessage}</p>}
      </section>

      <section className="card">
        <h2>Deine Wörter ({state.ownVocab.length})</h2>
        {state.ownVocab.length === 0 ? (
          <p>Noch keine eigenen Wörter.</p>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Englisch</th>
                  <th>Deutsch</th>
                  <th>WS</th>
                  <th aria-label="Aktionen" />
                </tr>
              </thead>
              <tbody>
                {state.ownVocab.map((v) => (
                  <tr key={v.id}>
                    <td lang="en">
                      {v.en} <SpeakButton text={v.en} />
                    </td>
                    <td>{v.de}</td>
                    <td>{v.workshop}</td>
                    <td>
                      <button type="button" className="bad-btn small" onClick={() => removeOwnVocab(v.id)} aria-label={`${v.en} löschen`}>
                        Löschen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" className="bad-btn" onClick={clearAll}>
              Alle eigenen Wörter löschen
            </button>
          </>
        )}
      </section>
    </>
  );
}
