export type Route =
  | { name: 'home' }
  | { name: 'vocab' }
  | { name: 'vocab-own' }
  | { name: 'grammar' }
  | { name: 'topic'; topicId: string }
  | { name: 'mock' }
  | { name: 'progress' };

export function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#?\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const [first, second, ...rest] = parts;
  if (rest.length) return { name: 'home' };
  switch (first) {
    case undefined:
      return { name: 'home' };
    case 'vokabeln':
      if (second === undefined) return { name: 'vocab' };
      return second === 'eigene' ? { name: 'vocab-own' } : { name: 'home' };
    case 'grammatik':
      return second === undefined ? { name: 'grammar' } : { name: 'topic', topicId: second };
    case 'probetest':
      return second === undefined ? { name: 'mock' } : { name: 'home' };
    case 'fortschritt':
      return second === undefined ? { name: 'progress' } : { name: 'home' };
    default:
      return { name: 'home' };
  }
}
