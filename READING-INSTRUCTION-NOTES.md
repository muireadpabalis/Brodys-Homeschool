# Brody: seven-week Reading Evidence Lab

The Reading Evidence Lab adds seven Grade 7 instructional modules after Brody's completed Reading / ELA Baseline. The baseline remains a separate, locked historical assessment. The course does not correct diagnostic answers, assign a diagnostic percentage or letter grade, make a placement decision, or treat Grade 7 readiness as remediation.

## Instructional progression

| Week | Module | Main work |
| --- | --- | --- |
| 1 | Close Reading, Sequence & Context | Sequence a NASA investigation, prove the order with textual language, and resolve multiple-meaning words from context. |
| 2 | Dialogue, Character & Author Choices | Trace a pivotal line through a character's thinking, action, and later plot event in original short fiction. |
| 3 | Claims & Evidence | Audit varied claims as completely, partly, or not supported, including one deliberately ridiculous claim. |
| 4 | Strongest Evidence | Select two strongest details, reject a tempting weak detail, and locate evidence independently. |
| 5 | How Far Can the Evidence Go? | Interpret limited experiment or study data and rewrite an overconfident claim precisely. |
| 6 | What Evidence Are We Missing? | Design relevant next evidence for engineering, history, and everyday mysteries. |
| 7 | Reading Investigation | Compare two-source NASA or Death Valley packets and write a concise, limited conclusion. |

The recurring routine is:

> CLAIM → EVIDENCE → DOES THE EVIDENCE ACTUALLY PROVE IT? → WHAT IS MISSING?

Weeks 1, 2, 4, 5, and 7 offer two topics with the same reasoning demand. Each module contains a short lesson, vocabulary, an engaging source/story/data set, automatically checked objective practice, and a constructed response. Correctness is not required to record completion. Every completed module keeps an immutable checkpoint and is suitable for the portfolio.

## Parent review

The existing parent passphrase gate protects the Reading review screen from casual student access. Each week's written reasoning is reviewed separately for:

- answering the actual question;
- using relevant evidence;
- explaining the connection between evidence and conclusion;
- limiting the claim to what the evidence establishes.

The parent records a date, assistance level, review status, and narrative note. Reasonable evidence-supported wording receives credit; no combined grade is calculated.

Reviews are attached to the immutable checkpoint ID that was displayed to the parent. The parent screen evaluates that saved checkpoint, even if Brody later edits a draft. A later checkpoint makes an earlier review historical until the parent reviews the new checkpoint; the summary counts only a review attached to the latest checkpoint. A review cannot be saved for an unstarted week or from a stale form opened before a newer checkpoint.

## Persistence and baseline preservation

New Reading records use only these keys:

- `brodyReadingCourse2026_reading7-w1` through `brodyReadingCourse2026_reading7-w7`
- `brodyReadingParent2026`

The completed baseline remains at `brodyBaseline2026_reading`. The course store does not read, write, migrate, rescore, unlock, or delete that key. Main-record synchronization rereads `brodyHomeschoolRecordV1` and updates only assignments and portfolio records whose IDs are `reading7-w1` through `reading7-w7`.

The current baseline definitions are frozen at:

- `assessments/reading.json`: `84348C0CFB586601D42C0DAA0EA3FBEF7A717F2DD82ABA6FC617E32C5E85959B`
- `assessments/reading.parent.json`: `C473573C64C8EF2A6E9EC2BF077EF7070CCC9540C617EA60EA6F553704B09F41`

Student Reading exports contain course work and checkpoints without the baseline or parent review. Parent exports include Reading work and review in addition to the existing complete-record backup. Restore validates all module IDs, question types and option IDs, checkpoint results, topic and skill metadata, and parent-review checkpoint references before writing. It keeps current local values on conflicts, merges missing immutable checkpoints, rejects conflicting completed topic choices, and rolls back Reading-key writes if a restore fails. If a malformed local Reading record is encountered, the parent backup contains a raw archival safety copy; that copy is not automatically restored over the malformed record.

## Sources and scope

The course includes original fiction and clearly labeled fictional practice data. Real-event passages are original summaries linked to NASA/JPL, NASA Science, the National Park Service, and the published 2014 sliding-rock study. California Grade 7 ELA standards are linked from the course. The modules address selected reading and evidence-reasoning standards; they are not a complete yearlong ELA curriculum.

## Verification

`tests/reading-qa.cjs` uses synthetic, isolated records. It verifies the seven-week curriculum contract, answer-key integrity, source packets, separate storage, byte-for-byte baseline preservation, main-record isolation, idempotent portfolio synchronization, student/parent export boundaries, conflict-safe restore, rollback, malformed-record preservation, stable assignment-card IDs, and JavaScript syntax. `tests/reading-qa-results.json` records the passing run. No browser containing Brody's real responses is read or changed.
