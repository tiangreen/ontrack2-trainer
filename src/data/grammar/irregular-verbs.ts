import type { GrammarTopic } from '../../types';
import { irregularVerbItems } from '../irregularVerbs';

export const irregularVerbsTopic: GrammarTopic = {
  id: 'irregular-verbs',
  workshop: 'W2',
  title: 'Irregular verbs',
  titleDe: 'Unregelmäßige Verben',
  rule: {
    form: [
      'Unregelmäßige Verben haben drei Formen: Infinitiv – simple past (2. Form) – past participle (3. Form), z. B. go – went – gone.',
      'Regelmäßige Verben bilden beides mit -ed (play – played – played); unregelmäßige Verben musst du auswendig lernen.',
      'Bei manchen Verben sind Formen gleich: put – put – put, buy – bought – bought.',
    ],
    usage: [
      'Die 2. Form brauchst du im simple past: I went to London last year.',
      'Die 3. Form brauchst du im present perfect (have/has + 3. Form): I have gone to London.',
      'In Frage und Verneinung im simple past steht nach did die Grundform: Did you go? I did not go.',
    ],
    signalWords: ['yesterday', 'last week', 'ago (simple past)', 'ever', 'never', 'just', 'already', 'yet (present perfect)'],
    examples: [
      { en: 'We went to the zoo yesterday.', de: 'Wir sind gestern in den Zoo gegangen.' },
      { en: 'I have never eaten sushi.', de: 'Ich habe noch nie Sushi gegessen.' },
      { en: 'She wrote a letter last week.', de: 'Sie hat letzte Woche einen Brief geschrieben.' },
      { en: 'Have you seen my keys?', de: 'Hast du meine Schlüssel gesehen?' },
      { en: 'He has just broken his pencil.', de: 'Er hat gerade seinen Bleistift abgebrochen.' },
    ],
    pitfalls: [
      'Falsch: I have went. Richtig: I have gone (3. Form nach have/has).',
      'Falsch: I seen him. Richtig: I saw him (simple past) oder I have seen him (present perfect).',
      'Falsch: Did you went? Richtig: Did you go? (nach did die Grundform).',
      'be hat im simple past zwei Formen: I/he/she/it was, you/we/they were.',
      'Nicht -ed anhängen: Falsch: I buyed. Richtig: I bought.',
    ],
  },
  items: irregularVerbItems(),
};
