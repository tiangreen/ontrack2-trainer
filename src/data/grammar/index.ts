import type { GrammarTopic } from '../../types';
import { goingToTopic } from './going-to';
import { willTopic } from './will';
import { goingToVsWillTopic } from './going-to-vs-will';
import { comparisonTopic } from './comparison';
import { pastProgressiveTopic } from './past-progressive';
import { presentPerfectTopic } from './present-perfect';
import { irregularVerbsTopic } from './irregular-verbs';
import { modalsTopic } from './modals';
import { mixedTensesTopic } from './mixed-tenses';

export const grammarTopics: GrammarTopic[] = [
  goingToTopic,
  willTopic,
  goingToVsWillTopic,
  comparisonTopic,
  pastProgressiveTopic,
  presentPerfectTopic,
  irregularVerbsTopic,
  modalsTopic,
  mixedTensesTopic,
];
