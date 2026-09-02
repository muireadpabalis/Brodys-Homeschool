# Homeschool portal delivery — 2026–2027

## Delivery status

Both existing repositories were fetched and inspected before edits. This document describes the validated release contents. Repository commit history and GitHub Pages deployment status identify which release is live.

The source ZIPs contain the complete updated static sites. The Git-history ZIPs contain the same sites plus their original history and the new commits. Do not upload a ZIP as a file to GitHub Pages: apply its site contents to the corresponding repository. Serve through HTTP or GitHub Pages; opening diagnostic.html directly as a file does not support its JSON fetches.

## What changed

- Rory uses Brody's actual canonical shell, stylesheet, subject-topic navigation, recordkeeping forms, and reports while retaining Grade 3 course content and existing records.
- Both portals have five linked assessments, diagnostic completion tracking, parent reports, JSON/CSV exports, printable reports, independent-writing rubrics, complete backups, and a conservative backup merge.
- New diagnostics use neutral A–E choices, previous/next and answer review, locally saved drafts, all-responses-required submission, and locked final attempts. No correctness or standards metadata is rendered in the student interface. Optional exposure questions distinguish remembered instruction from student-reported non-exposure.
- Eight new assessments contain **269 items total**. Reading passages and prompts are original. Language assessments are shorter to accommodate three independent writing tasks.

| Assessment | Brody | Rory |
|---|---:|---:|
| Reading | 35 | 35 |
| Writing / Language | 24 choices + 3 writing samples | 24 choices + 3 writing samples |
| Science | 35 | 35 |
| History–Social Science / Geography | 40 | 35 |
| Existing Math, retained | 68 | 45 |

Brody's existing 68-item Math assessment was retained under the explicit instruction to preserve existing Math; no new assessment exceeds 45 items.

## Math findings and fixes

Brody's HTML loaded math-assessment.js, which lacked E and permitted blanks. The repository also contained an unused Brody_Math_Assessment_v1_1.js with some intended fixes. The live script now requires valid responses, adds E without shifting A–D or question IDs, keeps prior records, and provides section navigation. Existing submitted attempts, including legacy blanks, remain locked and are reported honestly.

Rory's global stylesheet did not define the Math page's .hidden class. Submission/done elements could therefore be displayed in inappropriate states. Shared diagnostic CSS fixes visibility, radio sizing, and mobile controls. Question 28 originally had two correct choices: 3 quarters and 7 dimes plus 5 pennies. Existing attempts retain the original choices and receive credit for A or B. New attempts store itemVersion: 2 and use “7 dimes” as the B distractor. All other Math prompts and A–D answer choices were preserved.

Answer keys and diagnostic metadata were removed from active student Math payloads and are loaded by the parent report. Legacy unused source files were retained. Selected original Math items that probe symbolic multiplication/division, fraction notation/comparison, elapsed-time readiness, or representative sampling are interpreted conservatively as readiness in the parent report; original metadata remains available in exports.

## Standards and interpretation

Authoritative sources consulted on September 2, 2026:

- [Massachusetts ELA/Literacy Framework (2017)](https://www.doe.mass.edu/frameworks/ela/2017-06.pdf)
- [Massachusetts Science and Technology/Engineering Framework (2016)](https://www.doe.mass.edu/frameworks/scitech/2016-04.pdf)
- [Massachusetts History and Social Science Framework (2018)](https://www.doe.mass.edu/frameworks/hss/2018-12.pdf)
- [California ELA/Literacy Standards](https://www.cde.ca.gov/be/st/ss/documents/finalelaccssstandards.pdf)
- [California History–Social Science Standards](https://www.cde.ca.gov/be/st/ss/documents/histsocscistnd.pdf)
- [California NGSS and course models](https://www.cde.ca.gov/ci/pl/ngssstandards.asp)
- [California Grade 3 Science](https://www.cde.ca.gov/ci/pl/documents/cangssgr3-dci.pdf)
- [California preferred integrated Grade 7 Science](https://www.cde.ca.gov/ci/pl/documents/preferredintegratedgr7.pdf)

Mappings identify a related standard, domain, or curriculum expectation. Each item samples a component; it does not establish full mastery of an entire performance expectation. A readiness reference in the Massachusetts field is explicitly identified as later-grade content rather than falsely labeled as an exit expectation. For broader practices and prerequisites, descriptive expectations are used instead of fabricated standard numbers.

Massachusetts History places India, China, Greece, and Rome in its Grade 7 sequence. Grade 6 includes Western Asia/North Africa, Sub-Saharan Africa, and the Americas. California's Grade 6 ancient-world sequence leads into Grade 7 standard 7.1 on Rome. Brody's test therefore checks the actual Massachusetts Grade 6 scope and includes a separately labeled transition band (T), followed by readiness band C. The report traces Mesopotamia → Egypt → ancient Israel/Hebrews → India → China → Greece → Rome, while warning that scattered correct answers do not prove a linear instructional stopping point.

The parent-provided fact that Brody has not studied Rome is recorded as known instructional history. No other instructional history is fabricated. The report proposes Roman foundations → Republic → Empire → political/social developments → decline/fall of the Western Empire and Eastern continuity. Parent exposure notes can refine classifications as evidence is gathered.

“Secure evidence” requires at least three scored items and 80% correct within a domain/band. This is an explicitly disclosed, provisional planning heuristic, not a validated mastery cutoff. Smaller samples are labeled insufficient for a mastery claim. Incorrect responses are potential misconceptions requiring confirmation. E does not establish non-exposure by itself. Readiness items do not generate automatic remediation labels.

## Records and access

Existing keys remain unchanged:

- Brody portal: brodyHomeschoolRecordV1
- Brody Math: brodyMathDiagnosticV1
- Rory portal: roryHomeschoolRecordV2
- Rory Math: rory_math_baseline_v1

New keys are student-specific: brodyBaseline2026_* / roryBaseline2026_*, parent review notes, and local parent-access settings. Browser localStorage is scoped to origin; both GitHub Pages repository paths share an origin, so distinct keys are essential. No existing key was silently renamed or erased. Corrupt school records halt safely instead of being overwritten. Full exports include attempts as well as logs, assignments, assessments, portfolio entries, and parent review notes. A merge preserves existing IDs and attempts, including submitted attempts; it is not a destructive replacement.

The parent passphrase provides a casual-access screen only. GitHub Pages is a public static host: a determined user can inspect public source/JSON or modify browser storage. True secret answer keys and tamper-resistant access would require authenticated server storage. No server or account migration was introduced. Parents should initialize the passphrase before student use, export records regularly, and keep student-record downloads private. Nothing is sent to a remote database.

## Parent review before use

1. Confirm the destination school's exact Science course model and current units. Grade 7 readiness uses California's preferred integrated model; districts can use a discipline-specific model.
2. Confirm prior school exposure and annotate the report using school records, work samples, and discussion. Parent reports must be based on the children's actual responses, not the synthetic QA data used in testing.
3. Read the new assessments before administration and allow breaks, especially for Rory. Reading tests sample selected skills using short passages; they do not establish independent fluency or performance across full-length grade-level texts. Observe oral reading separately.
4. Have children produce writing independently. Record handwriting/typing/dictation and any assistance; rubric scores are entered by a parent. A checkbox non-response is insufficient evidence, not an automatic writing zero.
5. California Grade 3 local history requires the actual destination community; generic readiness items do not substitute for local Indigenous history and community study.

## Verification

The automated browser suite passed 14 end-to-end groups covering both portals, all eight new assessments, both Math Diagnostics, and parent reporting. It exercised all new questions through the student controls, including previous/next, changed answers, refresh, required responses, submission, lock persistence, mobile width, and exports. Structural validation checked IDs, counts, four distinct academic choices plus E, valid key indices, required mappings, and key-free student JSON.

Additional browser checks passed for assignments, learning logs, portfolio persistence, whitespace-only writing rejection, explicit unknown writing, cross-tab submission locks, conservative backup merging, preservation of unreadable records, and both legacy/new scoring for Rory's ambiguous currency item. Exported JSON and CSV were read back and checked for full item evidence, preserved writing, and the Rome transition classification. Desktop/mobile screenshots and printable parent-report output were inspected. No real student browser records were used or changed; tests ran in isolated browser contexts.

Repository-relative paths were tested locally under /Brodys-Homeschool/ and /Rorys-Homeschool/. Publishing is performed through staged GitHub changes, followed by verification of both live Pages deployments.
