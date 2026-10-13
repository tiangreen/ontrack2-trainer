export type WorkshopId = 'W1' | 'W2';
export type TopicId =
  | 'simple-present'
  | 'present-progressive'
  | 'going-to'
  | 'timetable-future'
  | 'will'
  | 'going-to-vs-will'
  | 'comparison'
  | 'simple-past'
  | 'past-progressive'
  | 'present-perfect'
  | 'irregular-verbs'
  | 'modals'
  | 'mixed-tenses';

/** prompt contains "___" exactly once; hint = base form / help in brackets, e.g. "(go)" */
export interface GapItem {
  kind: 'gap';
  id: string;
  prompt: string;
  hint?: string;
  answers: string[];
  explanation: string;
}
export interface ChoiceItem {
  kind: 'choice';
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
/** Whole sentences (transform / translate); self-assessment allowed on mismatch. */
export interface WriteItem {
  kind: 'write';
  id: string;
  instruction: string;
  prompt: string;
  answers: string[];
  explanation: string;
}
export type ExerciseItem = GapItem | ChoiceItem | WriteItem;

export interface RuleCard {
  form: string[];
  usage: string[];
  signalWords: string[];
  examples: { en: string; de: string }[];
  pitfalls: string[];
}
export interface GrammarTopic {
  id: TopicId;
  workshop: WorkshopId;
  title: string;
  titleDe: string;
  rule: RuleCard;
  items: ExerciseItem[];
}

export type VocabTopic =
  | 'feelings'
  | 'plans-jobs'
  | 'weather'
  | 'town-places'
  | 'adjectives'
  | 'history'
  | 'travel-sights'
  | 'health'
  | 'rules-permission'
  | 'own';
export interface VocabEntry {
  id: string;
  en: string;
  de: string;
  workshop: WorkshopId;
  topic: VocabTopic;
  example?: string;
}

export interface MediationItem {
  id: string;
  workshop: WorkshopId;
  situation: string;
  de: string;
  answers: string[];
}

export type CheckStatus = 'correct' | 'almost' | 'wrong';
/** expected = answers[0] or options[correctIndex] */
export interface CheckResult {
  status: CheckStatus;
  expected: string;
}

export interface VocabStat {
  right: number;
  wrong: number;
  last: 'right' | 'wrong';
}
export interface TopicStat {
  attempts: number;
  lastPercent: number;
  bestPercent: number;
}
export interface MockResultRecord {
  date: string;
  workshops: WorkshopId[];
  points: number;
  maxPoints: number;
  grade: number;
}
export interface AppState {
  version: 1;
  ownVocab: VocabEntry[];
  vocabStats: Record<string, VocabStat>;
  topicStats: Partial<Record<TopicId, TopicStat>>;
  mockResults: MockResultRecord[];
}
