# Brody’s seven-week History–Social Science bridge

2026–2027 · Grade 7 transition · Sean, primary instructor

## Start here

Brody opens **Assignments → History–Social Science**, chooses a week, and opens a lesson. The course overview is also available at [History with Dad](history-bridge.html). Sean opens **Reports → Open parent reports**, unlocks the existing parent area, and expands **History with Sean**.

Each week has a Dad’s Lesson with the topic, intended understanding, important ideas, discussion questions, misconceptions, optional video searches, and a big question. Sean chooses the actual video. Every lesson provides a topic, search phrase, approximate length, and two or three listening targets; the course does not depend on fixed YouTube links.

## Fixed sequence

| Week | Purpose | Lessons |
| --- | --- | ---: |
| 1 | Massachusetts review: chronology, sources, agriculture, Mesopotamia, Egypt | 4 |
| 2 | Massachusetts review: Israel/Hebrews, Phoenicians, Sub-Saharan Africa, ancient Americas and trade | 4 |
| 3 | California sequencing bridge: Ancient India | 3 |
| 4 | California sequencing bridge: Ancient China | 3 |
| 5 | California sequencing bridge: Ancient Greece | 3 |
| 6 | Ancient Rome as new instruction: Republic, crisis, Empire, systems and evidence | 5 |
| 7 | California Grade 7 on-ramp: interacting causes, western transformation, eastern continuation | 4 |

The 26 lessons follow **WATCH → DISCUSS → LOCATE → CONNECT → ANALYZE → DEMONSTRATE**. Maps, timelines, comparisons, artifact analysis, oral explanations, cause diagrams, and short evidence-based writing give Brody different ways to demonstrate understanding. Paper and oral work can be recorded through a description or work-sample reference. Written responses stay focused on a claim, evidence, and explanation.

Week 6 provides genuine instruction, reflecting the parent-confirmed absence of formal Rome instruction. Week 7 builds on that sequence and does not claim to replace the California Grade 7 course. The final task asks Brody to reconstruct the Roman sequence, distinguish west from east, and use relevant evidence in a multicausal explanation.

## Save work and record teaching

Student working notes save locally as they are entered. **Save demonstration checkpoint** requires a response, demonstration format, and honest assistance selection. Each checkpoint preserves a dated copy; later revisions do not replace it. A saved demonstration marks the assignment complete and adds its evidence link to the existing portfolio. Completion is not a mastery judgment.

Sean records the date, actual minutes, type of teaching, what he taught or modeled, what Brody reviewed, independent evidence, further review, and comparison with the original diagnostic. Parent form edits save as drafts. **Save Sean’s lesson record** commits an observation to the teaching record; drafts remain distinct from evidence of instruction. Refresh results to update the on-screen report. Exports and printing use the current saved records automatically.

When a saved lesson record includes a date, minutes, and instruction, it also creates a dated entry in the existing learning log. Updating the same lesson and date updates that log entry; teaching on another date creates another entry. Earlier observations remain available in the History JSON record.

Learning statuses are **Introduced, Practiced, Demonstrated with support, Demonstrated independently,** and **Review needed**. Independent status requires independent assistance and specific evidence. Weeks 1–2 use **Confirmed, Needs brief review,** or **Needs additional instruction** for the review checkpoint. Sean records the task, evidence, help, and next step.

## History Bridge Summary

The parent area builds a printable, editable summary from saved demonstrations and committed observations. Its ten sections cover Massachusetts material confirmed; Massachusetts material reviewed; California sequencing gaps taught; India, China, Greece, and Rome evidence; Fall of Rome readiness; remaining reinforcement; and information for the California teacher.

Nothing is premarked mastered. Empty sections remain empty until evidence is recorded. The summary includes a count of pending parent drafts without treating them as completed instruction. Sean can add a concise handoff note to each section and print the History summary alone.

The original 40-question diagnostic remains a local, nonstandardized baseline. The bridge does not calculate an overall diagnostic percentage or grade, classify unknown/not-taught responses as incorrect, or infer failed learning from a missed item. Earlier uncertainty calls for review and confirmation. Instructor context is shown after the existing parent gate; student course pages do not request diagnostic answer keys or the instructor-guide payload.

## Exports and continuity

- **History JSON:** curriculum, current student work, dated checkpoints, committed parent observations, saved parent drafts, weekly findings, and the ten-section summary.
- **Teaching CSV:** one row per lesson with the latest committed teaching observation, standards, assistance, instructional type, and latest student demonstration. Draft observations are excluded; historical observations remain in JSON.
- **Full Record:** existing portal records, diagnostics, ELA records, and History data together. Restore accepts supported History exports through the existing parent backup control.

Restore keeps current fields and findings while adding missing checkpoints and observations. Invalid History records are rejected before writes. If History data is unreadable, the full backup retains the raw History keys for recovery. A conflicting student tab stops automatic saving and offers export before reload.

The update adds stable History assignment IDs and separate History storage keys. It retains the existing design, navigation, diagnostic attempts, Math diagnostic, 39-lesson ELA bridge, logs, portfolio, and prior storage keys. Records continue to belong to the same browser/device; use Full Record when transferring them.

## Standards and instructional scope

The lessons cite the [Massachusetts 2018 History and Social Science Framework](https://www.doe.mass.edu/frameworks/hss/2018-12.pdf), [California History–Social Science Standards](https://www.cde.ca.gov/be/st/ss/documents/histsocscistnd.pdf), and primary museum, archaeological, and historical sources. Each week’s instructor area identifies the relevant standards and scope; lesson source links support the evidence activities.

The course uses selected California Grade 6 expectations for India (6.5), China (6.6), Greece (6.4), and Rome (6.7), then a focused introduction to Grade 7 standard 7.1. It does not claim comprehensive mastery of those standards. The Andean terrace activity identifies later Inka evidence as a geographic comparison instead of presenting the whole Inka period as Massachusetts Grade 6 content. Religious and philosophical traditions are discussed as historical developments; Athenian participation limits and the continued eastern empire are explicit.

Sean can adapt pacing and video choices. Before enrollment, use the final evidence summary to confirm the destination class’s current unit and any prerequisites still needing attention.

## Verification

Isolated synthetic browser tests verified all 26 History pages, seven-week filters, repeated loading without duplicate assignments, autosave/resume, checkpoint preservation, honest assistance recording, parent-guide gating, dated teaching logs, portfolio links, JSON/CSV/full exports, conservative restore, mobile layout, and the printable ten-section summary. Edge checks cover malformed records, chronological checkpoint merging, parent drafts, fresh printing, and stale-tab conflicts.

The existing ELA regression suite passed all 39 assignments, prerequisite and independent-task controls, saved drafts, parent review, complete backup/restore, mobile layout, and storage-error handling. No actual student responses were entered or changed during QA.

Reproduce with a local HTTP server and Node.js plus Playwright: run `tests/history-qa.cjs`, `tests/history-edge-qa.cjs`, and `tests/ela-qa.cjs`. Set `HISTORY_QA_URL` or `ELA_QA_URL` to the served portal URL, `HISTORY_QA_OUT` or `ELA_QA_OUT` to an existing results directory, and `CHROME_PATH` when needed. Passing result JSON files accompany the scripts.
