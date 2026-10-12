const TILES = [
  { href: '#/vokabeln', icon: '📚', title: 'Vokabeln', text: 'Wörter zu Workshop 1 und 2 üben – auch deine eigenen.' },
  { href: '#/grammatik', icon: '🧩', title: 'Grammatik', text: 'Regeln nachlesen und mit Übungen festigen.' },
  { href: '#/probetest', icon: '⏱️', title: 'Probetest', text: 'Ein Leistungsnachweis zum Üben – mit Zeit, Punkten und Note.' },
  { href: '#/fortschritt', icon: '📈', title: 'Fortschritt', text: 'Sieh nach, was schon sitzt und was du wiederholen solltest.' },
];

export function Home() {
  return (
    <>
      <h1>Fit für den Leistungsnachweis</h1>
      <p className="lead">
        On Track 2 – Workshop 1 (going to, will, Steigerung) und Workshop 2 (past progressive, present perfect,
        unregelmäßige Verben, modal verbs).
      </p>
      <div className="tiles">
        {TILES.map((t) => (
          <a key={t.href} href={t.href} className="tile">
            <span className="tile-icon" aria-hidden="true">
              {t.icon}
            </span>
            <strong>{t.title}</strong>
            <span>{t.text}</span>
          </a>
        ))}
      </div>

      <section className="card">
        <h2>So gehst du vor</h2>
        <ol>
          <li>Trag unter „Vokabeln → Eigene Wörter“ die Vokabeln aus deinem Buch ein.</li>
          <li>Lies in „Grammatik“ jede Regelkarte und mach die Übungen, bis du über 80 % hast.</li>
          <li>Schreib ein paar Tage vor dem Leistungsnachweis einen Probetest – ohne Spicken!</li>
          <li>Wiederhole danach gezielt die Themen, bei denen du Fehler gemacht hast.</li>
        </ol>
      </section>

      <section className="card">
        <h2>Lerntipps</h2>
        <ul>
          <li>
            <strong>Signalwörter lernen:</strong> <em>yesterday</em> → simple past, <em>already/yet/ever</em> → present
            perfect, <em>Look!</em> → going to, <em>I think / probably</em> → will.
          </li>
          <li>
            <strong>Fehlerwörter wiederholen:</strong> Wähle im Vokabeltrainer „Nur schwierige Wörter“ – so übst du genau
            die Wörter, die du zuletzt falsch hattest.
          </li>
          <li>
            <strong>Lieber oft und kurz:</strong> Jeden Tag 10 Minuten bringen mehr als einmal zwei Stunden.
          </li>
          <li>
            <strong>Rechtschreibung zählt:</strong> „Fast richtig“ wird hier wie im Test als Fehler gewertet.
          </li>
        </ul>
      </section>
    </>
  );
}
