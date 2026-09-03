# Brody: seven-week ELA writing bridge

39 actual assignments extend the existing Assignments / English Language Arts area. Original navigation, diagnostic files, storage keys, daily logs, and portfolio records are retained. The local base was checked against published commit `02f687da14d40e642e31989d77505fb12190708e` and matched apart from line endings before these changes.

## Teaching sequence

| Week | Assignments | Focus | Scaffolding |
| --- | ---: | --- | --- |
| 1 | 6 | Familiar-topic brainstorm, grouping, five-paragraph outline, paragraph, complete essay, revision | High |
| 2 | 6 | Paragraph parts, development, clauses, connected paragraphs, second composition | High–moderate |
| 3 | 5 | Revise previous writing for clause control, compound/complex sentences, fluency | Moderate |
| 4 | 6 | Story brainstorm, map, opening, scene, narrative, revision | Moderate |
| 5 | 6 | Younger-reader explanation, outline, development, cohesion, limited source use, revision | Moderate–low |
| 6 | 6 | Claim, ranked reasons, evidence and reasoning, outline, draft, opposing view, revision | Low |
| 7 | 4 | Coordinate adjectives, cumulative language review, new independent argument, reflection | Independent final task |

The five-paragraph form is explicitly a temporary structural teaching tool. Narrative uses a story map; later informational and argument writing permit paragraph counts suited to the content. Models are separate from assigned topics. No completed student outline, thesis, reasons, or examples are supplied.

Each lesson shows week/sequence, objective, directions, effort, task type, and relevant California Grade 7 standard identifiers. Foundational language review is identified as prerequisite practice where appropriate. Standards source: [California Department of Education](https://www2.cde.ca.gov/cacs/ela?c0=2&c2=3%2C1%2C13%2C17&page=1). This unit addresses selected writing/language standards, not all Grade 7 ELA requirements.

## Student workflow

Open Assignments, select English Language Arts and a week, then open assignments in sequence. Text and checklist responses save on input. “Save & continue later” explicitly saves current responses. “Save checkpoint & mark complete” preserves an immutable dated copy, updates assignment progress, and creates a linked portfolio entry. Revising does not overwrite earlier snapshots. Separate assignments preserve outlines, original compositions, and revised final copies.

The final task is locked until the parent releases a new, unpracticed argument prompt. The parent may replace the suggested prompt before release, must confirm novelty, and should first finish Week 7 language practice. Once released, the prompt remains fixed. Brody receives only the prompt, blank brainstorm/outline/draft/final spaces, and basic saving instructions. Each stage is preserved before the next opens. No model, suggested ideas, sentence starters, or revision checklist is shown in this task. Parent observations distinguish assisted performance from independent performance.

## Parent review and evidence

The existing parent passphrase gate controls the new review screen. Six quality dimensions are assessed separately: idea development, organization, support/evidence, paragraph development, sentence construction, and conventions. Independence is recorded with the separate 0–3 assistance scale. The final task also records assistance by stage. No combined grade hides independence behind mechanics. Comments and ratings are not rendered or exported in the student interface.

The parent area's full-record export includes the existing school record and diagnostics plus all ELA responses, checkpoints, released prompt, and parent reviews. The ELA-only parent export includes these ELA components and the curriculum. Student ELA exports include student work, curriculum, and released prompt only. Both full-record and ELA-only JSON backups can be restored through the parent area. Current values win conflicts and missing snapshots are merged. Printing the parent report expands ELA evidence.

Persistence remains local to this browser and origin, as in the existing portal. Publish to the existing site URL to retain its browser records. Localhost previews do not contain records saved at the live GitHub Pages URL. The inherited passphrase is a casual-access gate on a static site, not server authentication. This implementation does not claim to protect static source files from inspection.

## Files and deployment

New runtime files: `ela-curriculum.js`, `ela-store.js`, `ela-student.js`, `ela-parent.js`, `ela-portal.js`, `ela.css`, `ela.html`.

Modified integration files: `index.html`, `parent.html`, `parent.js`.

No build or additional runtime dependencies are required. Upload the runtime files together with the three integration files to the existing repository. Do not change `portal-config.js`, browser storage keys, domain, or Pages path. The full portal archive also includes the unchanged existing assessment and portal files.

These changes were validated locally before publication. GitHub commit history and Pages deployment status identify the live version. No production student responses were accessed or modified.

## Verification

`tests/ela-qa.cjs` uses Playwright with isolated synthetic records. It checks every assignment and response field, weekly filtering, migration idempotence, prerequisite gates, drafts/checkpoints, parent access and review persistence, the independent task, portfolio integration, backup/restore, mobile width, and explicit storage failure. `tests/ela-qa-results.json` records the latest passing run. Tests use no real student answers.

Run a static server from the directory containing `Brodys-Homeschool` on port 8766, then run the test with Node and Playwright available. Optional environment variables: `ELA_QA_URL`, `ELA_QA_OUT`, `CHROME_PATH`.
