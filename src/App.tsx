import { useEffect, useState } from 'react';
import { GrammarList } from './components/GrammarList';
import { GrammarTopicPage } from './components/GrammarTopicPage';
import { Home } from './components/Home';
import { MockTest } from './components/MockTest';
import { Progress } from './components/Progress';
import { VocabEditor } from './components/VocabEditor';
import { VocabTrainer } from './components/VocabTrainer';
import { parseRoute, type Route } from './route';
import { AppStateProvider } from './state';

const NAV: { href: string; label: string; routes: Route['name'][] }[] = [
  { href: '#/', label: 'Start', routes: ['home'] },
  { href: '#/vokabeln', label: 'Vokabeln', routes: ['vocab', 'vocab-own'] },
  { href: '#/grammatik', label: 'Grammatik', routes: ['grammar', 'topic'] },
  { href: '#/probetest', label: 'Probetest', routes: ['mock'] },
  { href: '#/fortschritt', label: 'Fortschritt', routes: ['progress'] },
];

function Page({ route }: { route: Route }) {
  switch (route.name) {
    case 'home':
      return <Home />;
    case 'vocab':
      return <VocabTrainer />;
    case 'vocab-own':
      return <VocabEditor />;
    case 'grammar':
      return <GrammarList />;
    case 'topic':
      return <GrammarTopicPage key={route.topicId} topicId={route.topicId} />;
    case 'mock':
      return <MockTest />;
    case 'progress':
      return <Progress />;
  }
}

export default function App() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));

  useEffect(() => {
    const onHash = () => {
      setRoute(parseRoute(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return (
    <AppStateProvider>
      <header className="topbar">
        <a className="brand" href="#/">
          On Track 2 Trainer
        </a>
        <nav>
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className={n.routes.includes(route.name) ? 'active' : undefined}>
              {n.label}
            </a>
          ))}
        </nav>
      </header>
      <main>
        <Page route={route} />
      </main>
    </AppStateProvider>
  );
}
