# Repository Guidelines

## Project Overview
"On Track 2 Trainer" is a client-only web app (Vite + React 19 + TypeScript). It helps a 6th-grade Gymnasium pupil in Bavaria prepare for a short English test on *On Track 2 (Bayern)*, Workshop 1 and Workshop 2. It has four areas: vocabulary trainer, grammar rule cards with exercises, a timed mock test with grade, and progress tracking. Everything is stored in `localStorage`; there is no backend.

- **Language split:** The UI and explanations are **German**. Learning content (sentences, answers, vocab `en`) is **English**, using British spelling.
- **Content origin:** All content is self-written. Never copy textbook texts or the textbook word list. Pupils enter the exact book vocabulary themselves via "Eigene Wörter".

## Architecture & Data Flow
```
index.html → src/main.tsx → App.tsx (hash routing) → AppStateProvider (state.tsx) → page components
                                                         │
          src/data/* (static content) ──► src/logic/* (pure functions) ◄── components
                                                         │
                                       logic/storage.ts ⇄ localStorage['ontrack2-trainer.v1']
```
- **Routing:**
  - `src/route.ts` `parseRoute(hash)` is a hand-written hash parser.
  - `App.tsx` listens to `hashchange`. Unknown routes and extra path segments fall back to `home`.
  - Routes: `#/`, `#/vokabeln`, `#/vokabeln/eigene`, `#/grammatik`, `#/grammatik/<topicId>`, `#/probetest`, `#/fortschritt`.
  - To add a route, update the `Route` union, `parseRoute`, `Page` and `NAV` in `App.tsx`.
- **State:**
  - `src/state.tsx` is the **only** persistence path. It holds `useState(loadState)` plus `useEffect(saveState)`.
  - Components call `useAppState()` and its updaters: `recordVocab`, `recordTopic`, `addOwnVocab`, `removeOwnVocab`, `clearOwnVocab`, `addMockResult`, `resetProgress`.
  - Never touch `localStorage` elsewhere.
- **Logic** (`src/logic/`): pure and UI-free. Randomness is passed in as `rng: () => number`, so tests can use a seeded `mulberry32`. The UI seeds with `Date.now()`, inside handlers or `useState` initializers only (see lint note).
- **Page-local flow:** Multi-step screens use discriminated phase objects such as `{ name: 'setup' } | { name: 'running', … } | { name: 'review', … }` instead of boolean flags. Examples: `MockTest.tsx`, `VocabTrainer.tsx`. Fresh rounds are remounted via `key` (`GrammarTopicPage` uses `key={round.n}`, `App` uses `key={topicId}`).

### Behavioural invariants (product requirements; do not break)
- **`almost` counts as wrong everywhere.** It means Levenshtein ≤ 1 and normalized input ≥ 4 chars, and applies to gap and vocab only, never `write`. It is feedback only ("Fast! Achte auf die Schreibweise."), because spelling counts in the real test.
- **Mock test** (`logic/mockTest.ts`, `MOCK_COUNTS`):

  | Part | Questions | Points each | Content |
  |---|---|---|---|
  | A | 8 | 1 | vocab DE→EN |
  | B | 12 | 1 | gap/choice, round-robin over topics: 12 distinct topics (W1-only covers all 7 W1 topics) |
  | C | 3 | 2 | write items |
  | D | 2 | 2 | mediation |

  - In total that is 25 questions, 30 points and 20 minutes.
  - If a pool is too small, the test has fewer questions; never pad it.
  - An empty workshop list throws `Error('Bitte mindestens einen Workshop wählen')`.
- **Mock review** (`MockTest.tsx`): C/D answers that don't match need self-assessment (2/1/0). "Ergebnis berechnen" stays disabled until all self-assessments are set. `addMockResult` is called exactly once.
- **Grade key:** `logic/grading.ts` `gradeFromPercent` is the single place for it (87.5/75/62.5/50/25 % → grades 1–5, else 6). The UI shows it as a guideline: "Richtwert – jede Lehrkraft bewertet etwas anders."
- **Exercise runner** (`ExerciseRunner.tsx`): `onFinish` / `recordTopic` fires only for the **first** round, not for "Fehler wiederholen" rounds. Only a wrong `write` item offers "Meine Antwort war auch richtig".
- **Reset:** `resetProgress` clears stats and mock results but **keeps `ownVocab`**.
- **Storage:**
  - Key `ontrack2-trainer.v1`, `version: 1`.
  - Bad JSON or a wrong version triggers `console.warn` and falls back to the default state.
  - Valid data is shallow-merged with the defaults; there is no migration layer. Bump the key/version if the stored shape changes incompatibly.

## Answer Checking (`src/logic/answers.ts`): read before authoring content
- **`normalize` steps, in order:**
  1. NFC
  2. `’ ‘ ´ \`` → `'`
  3. lowercase
  4. strip commas
  5. collapse whitespace
  6. strip leading quotes and trailing quotes / `. ! ?`
  7. expand contractions: `won't`→`will not`, `can't`/`can not`→`cannot`, `n't`→` not`, `'m`, `'re`, `'ve`, `'ll`
- **`'s` and `'d` are NOT expanded** because they are ambiguous. Content must list both forms, e.g. `["she's gone", "she has gone"]`. `won't`/`will not` variants are not needed.
- **`checkItem`:** choice compares `correctIndex` by **index**; gap/write compare by exact normalized match against `answers`. The displayed solution is `answers[0]` or `options[correctIndex]`.
- **`checkVocab`:**
  - Splits the target on `/` and `;`.
  - Accepts the text with brackets kept, with the bracket content removed, or with only the bracket characters removed. Example: `to be afraid (of)` accepts `be afraid`, `be afraid of`, `to be afraid of`.
  - Leading `to ` (DE→EN) and leading articles `der|die|das|ein|eine ` (EN→DE) are optional.
- **Mediation (part D):** normalized exact match against `answers`; there is no semantic matching, so list 2–4 realistic variants.

## Key Directories
| Path | Purpose |
|---|---|
| `src/logic/` | Pure logic: `answers`, `mockTest`, `grading`, `random` (`mulberry32`, `shuffle`), `bulkVocab`, `storage` |
| `src/data/grammar/` | One `GrammarTopic` per file + `index.ts` registry (`grammarTopics`, fixed order) |
| `src/data/` | `vocab.ts` (`starterVocab`), `mediation.ts` (`mediationItems`), `irregularVerbs.ts` (verbs + `irregularVerbItems()` generator) |
| `src/components/` | Pages (`Home`, `VocabTrainer`, `VocabEditor`, `GrammarList`, `GrammarTopicPage`, `MockTest`, `Progress`) + shared (`ExerciseRunner`, `Feedback`, `SpeakButton`) |
| `public/` | Only `favicon.svg` |

## Content Conventions (`src/data/`)
- **Grammar topic file:**
  - `src/data/grammar/<topicId>.ts` exports one camelCase const, e.g. `going-to-vs-will.ts` → `goingToVsWillTopic`.
  - Fields: `title` (EN), `titleDe` (DE), rule card arrays `form/usage/signalWords/pitfalls` with German text, and `examples: {en, de}[]`.
- **Adding a topic:** extend the `TopicId` union in `src/types.ts`, add the topic to `grammarTopics` in `src/data/grammar/index.ts`, and update the expected order plus `MIN_ITEMS` in `src/data/data.test.ts`. Topics 1–7 are W1, 8–13 are W2.
- **Item IDs:**
  - Grammar items: `<topicId>-<nn>`, one sequence per topic for all kinds (e.g. `present-perfect-07`). IDs must be unique across all topics.
  - Generated irregular-verb items: `irregular-verbs-<base>-past|pp`.
  - Vocab: `<ws>-<topic>-<en-slug>`, generated in `vocab.ts` from rows `[en, de, example?]`. Example: `w2-history-to-rule`.
  - Mediation: `med-w1-01`.
  - Own words: `own-<time36>-<line>`.
- **Vocab IDs are persisted keys:** they key `vocabStats`. Changing the `en` text, topic or workshop of a starter word resets its stats.
- **Item kinds:**
  - `gap`: the `prompt` contains `___` **exactly once**; `answers` is only the missing text; `hint` is something like `"(go)"`.
  - `choice`: 3–4 `options`.
  - `write`: German `instruction` plus complete accepted sentences.
  - Every item has a German `explanation` (rule + signal word, 1–2 sentences).
- **Mix per topic (enforced by tests):** ≥ 60 % gap, ≥ 20 % choice, ≥ 4 write. Exceptions:
  - `mixed-tenses` has 0 write items.
  - `irregular-verbs` is generated: 53 verbs → 106 items.
- **Vocab text:** verbs take `to `, alternatives use ` / `, optional parts go in `( )`, German nouns carry an article. New vocab categories need the `VocabTopic` union plus the `TOPICS` list in `VocabTrainer.tsx`.

## Code Conventions & Common Patterns
- **Formatting:** TypeScript with 2-space indent, single quotes, semicolons (`main.tsx` keeps the template style). No formatter is configured; match the surrounding code.
- **Exports:** named exports for components, hooks and logic; only `App` is a default export.
- **Types:**
  - Shared domain types live in `src/types.ts`.
  - Use discriminated unions (`kind`, `section`/`type`, `name`).
  - Use `Record<K, V>` for static lookup tables (`LABEL` in `Feedback.tsx`).
- **TS flags:**
  - `verbatimModuleSyntax` → use `import type` for type-only imports.
  - `erasableSyntaxOnly` → no enums, namespaces or parameter properties.
  - `noUnusedLocals` and `noUnusedParameters` are on.
- **No extra dependencies by design:** no router, UI library or state library. Use native form controls, hash links and the Web Speech API (`SpeakButton`: `en-GB`, rate 0.9, renders nothing when unsupported).
- **Styling:** global `src/index.css` with semantic classes (`card`, `primary`, `choice`, `feedback`, `correct|almost|wrong`). Status colors come from `--ok`, `--almost`, `--bad` (and `-soft` variants). Touch targets are ≥ 44px; content max-width is 800px.
- **Errors:** logic throws an `Error` with a German message; the UI prevents invalid calls (e.g. a disabled button) and asks before destructive actions with `window.confirm`.

## Development Commands
```bash
./start.sh        # one-step start: checks Node, npm install if needed, then npm run dev (extra args → Vite)
npm install
npm run dev        # Vite dev server, http://localhost:5173 (next free port if busy)
npm test           # vitest run (all tests, one-shot)
npm test -- src/logic/answers.test.ts -t "marks a single typo as almost"
npm run build      # tsc -b && vite build → dist/
npm run lint       # oxlint
npm run preview    # serve dist/ on :4173
```

## Important Files
- `src/logic/answers.ts`: decides whether pupil answers count as correct. It is the riskiest file to change.
- `src/logic/mockTest.ts`, `src/components/MockTest.tsx`: how the mock test is assembled, timed and scored.
- `src/data/grammar/index.ts`: topic registry. It feeds the grammar list, progress, the mock test and the data tests.
- `src/state.tsx`, `src/logic/storage.ts`: persistence.
- `src/types.ts`: domain model, including the persisted `AppState`.
- `.oxlintrc.json`, `tsconfig.app.json` (app, bundler resolution), `tsconfig.node.json` (only `vite.config.ts`, nodenext), `vite.config.ts` (`react()` plus `base: './'` for relative asset paths).
- `README.md` is still the stock Vite template and not authoritative.

## Runtime/Tooling Preferences
- **Runtime:** Node + **npm** (lockfile `package-lock.json`). Use Node ≥ 22.12, because Vitest 5 needs `^22.12 || ^24 || >=26`.
- **Pinned versions** (lockfile): Vite 8.3, React 19, TypeScript 6.0, Vitest 5.0, oxlint 1.x.
- **Lint:** oxlint with the `react`, `typescript` and `oxc` plugins.
  - `react/rules-of-hooks` is an error.
  - `react/only-export-components` is a warning (constant exports allowed).
  - The default `react(purity)` rule flags `Date.now()` during render. Seed RNGs in handlers or in `useState(() => Date.now())`.
- **Deployment:** `.github/workflows/container.yml` runs `npm test` and `npm run lint` on every push to `main` (or manual dispatch), then builds the `Dockerfile` (Node build stage → `nginx:stable-alpine` serving `dist/`) for amd64/arm64 and pushes it to GitHub Packages as `ghcr.io/tiangreen/ontrack2-trainer` (tags `latest`, `sha-<short>`). Run: `docker run -p 8080:80 ghcr.io/tiangreen/ontrack2-trainer` → http://localhost:8080. nginx has no SPA fallback, so keep hash routing.
- No `scripts/` and no `docs/` exist; `start.sh` is the only helper script.

## Testing & QA
- **Framework:** Vitest with no config file and the default `node` environment. Tests are colocated as `*.test.ts` and cover logic and data only; there are no DOM or component tests.
- **What each test file covers:**
  - `logic/answers.test.ts`: normalization, contractions, `almost`, `checkVocab` variants.
  - `logic/grading.test.ts`: grade boundaries, as an `it.each` table.
  - `logic/bulkVocab.test.ts`: separators, duplicates, 1-based error lines.
  - `logic/mockTest.test.ts`: seed 42 gives 8/12/3/2 questions and 30 points with no duplicates; every part B question uses a different topic; a W1-only test covers every W1 topic in part B; W1-only stays W1; deterministic per seed; throws on `[]`. Topic membership is looked up by **item ID via `grammarTopics`, never by prefix**, because `going-to-` also matches `going-to-vs-will-`.
  - `data/data.test.ts`: content integrity — topic order, unique IDs, `___` exactly once, `correctIndex` in range, non-empty explanations and answers, `answers[0]` passes `checkItem` against itself, per-topic minimums and mix, 53 verbs / 106 items, vocab minimums per topic, ≥ 10 mediation items per workshop.
- **Content edits:** run `npm test` after any change in `src/data/`. A failing self-check usually means an answer relies on `'s`/`'d` or other punctuation that `normalize` doesn't handle.
- **Before finishing:** `npm test`, `npm run build` and `npm run lint` must all pass cleanly.
- **UI changes need a browser smoke test** via `npm run dev`:
  - Import 2 own words → "2 hinzugefügt" → practise with topic `own` → "Fehler nochmal üben".
  - Grammar round → overriding a `write` item counts as correct → result shows under `#/fortschritt`.
  - W1-only mock test → 25 questions, timer counts down → self-assessment gates "Ergebnis berechnen".
  - Reload keeps data.
  - `localStorage['ontrack2-trainer.v1']='kaputt'` → app resets with a console warning.
- **Not covered by tests:** pedagogical correctness and unambiguity of the content. Review data changes manually.
