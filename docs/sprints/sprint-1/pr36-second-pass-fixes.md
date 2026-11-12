# PR #36 second-pass review corrections

Recorded 2026-11-09. Tested source: `af36beb600615b318fb6665a11ae9b9944ff3666`, also in [verification JSON](pr36-second-pass-verification.json). This is a staging candidate; no main merge, tag, assessed release, final submission or renewed human approval is claimed.

Source: [R1NNE0's actual second-pass CHANGES_REQUESTED review](https://github.com/Maibokdaimhai/LECTRA/pull/36#pullrequestreview-5827880763), against `0ed97a4`. That review explicitly records R1–R4 as resolved and independently reports 37 unit, 2 liveness and 20 isolated browser regressions passing. It does not approve the full increment or independently reproduce the full earlier matrix. The first-pass evidence is retained in [its dated record](pr36-review-fixes.md).

## Findings and dispositions

| Finding | Implemented correction | Focused evidence |
| --- | --- | --- |
| N1 — submission becomes retryable while its outcome remains unknown | ResponseForm keeps an explicit unknown-outcome state when submission has an ambiguous/409/server-failure result. The automatic readback may resolve it; if readback also fails, submission remains blocked. Manual Check saved status is a GET only; failures retain the lock and attempted answers. A successful submitted read opens immutable readback. A successful not-submitted read unlocks an explicit user retry with retained answers. Form controls are disabled during submission/checking/unknown outcome. No request is automatically resent. | Two new HTTP/browser scenarios: committed response lost plus failed reconciliation then read-only success with one POST; uncommitted/lost response plus failed reconciliation then a successful not-submitted read and one deliberate retry. Mutation counts and retained selection are asserted. Existing real journey still verifies 422 validation retention and successful immutable readback. |
| N2 — navigation discards unsaved Draft edits | Workspace tracks dirty, saving and unresolved editor state. Back to survey list and Course/Section/Lecture selection or selector-page changes ask before discarding. Cancellation preserves selected context and mounted inputs; acceptance performs navigation explicitly. The same gate protects in-memory respondent edits/uncertainty. These controls do not write private drafts or answers to browser persistent storage. | New browser scenarios cover Back cancellation/acceptance, Course cancellation/acceptance, and Section/Lecture cancellation plus explicit discard. Inputs and selected values remain unchanged on cancel; no mutation is sent. Selector-pagination guarding uses the same function but is not separately exercised by these fixtures. |
| N3 — Publish/Close have no confirmation | Native confirmation runs before changing pending state or sending the mutation. Publish explains freezing the saved title/questions/scales and Section eligibility, identified mode, and once-only participation. Close explains permanently stopping responses, exposing scores/comments to the owner and no reopening. Draft deletion also receives its already-required F-03 confirmation while inspecting the same lifecycle controls. Cancellation leaves the form/state intact and sends no mutation. | New browser tests inspect confirmation text, cancel and then accept publish/close, and count mutations. A separate deletion scenario cancels and then accepts its confirmation. Real product journeys explicitly accept lifecycle dialogs; uncertain publish/close/delete regressions remain intact. |
| N4 — empty lectureId silently becomes an unfiltered read | The survey endpoint validates any present lectureId, including the empty string, instead of treating truthiness as presence. Absent lectureId remains an unfiltered scoped list; valid UUID filters retain ownership checks. | Real API/PostgreSQL test checks empty, whitespace, invalid UUID and duplicate lectureId return 422 VALIDATION_FAILED; a valid filter returns only its survey; an absent filter succeeds. |
| N5 — survey cards lack distinguishing context | Cards render Course code/title, Section code, Lecture title/date and mode alongside status and the respondent's existing participation flag. Values come from the existing safe API projection; no participant identity/answer data is added. | Browser card assertion checks Course/Section/date/mode. Real product journey checks the student's card before opening. A real API test checks context and mode for both owner and eligible respondent projections, with no answers property. |

These are corrections against the accepted LECTRA feature contracts and the human review, not new mandatory instructor requirements. Native confirmations use the browser's standard accessible dialog. Full keyboard/screen-reader certification of every dialog/browser is not inferred. Explicit page reload, confirmed account change and sign-out still follow the established in-memory privacy boundary; application navigation confirmation does not promise cross-reload draft recovery.

## Actual verification on the recorded source

Node 24.22.1, npm 10.9.2, PostgreSQL 17.11; no dependency changes.

| Executed check | Result |
| --- | --- |
| Typecheck and production build | Passed for the complete current source, including Prisma generation and API/web builds. |
| Unit | 37 passed. |
| API liveness | 2 passed. |
| Real API/PostgreSQL feature tests | 21 passed, including R3 membership concurrency and new N4/N5 checks. |
| Foundation | 9 passed. |
| PostgreSQL tooling | 2 passed. |
| Real product browser tests | 4 passed at 360px/1280px, accepting actual lifecycle confirmations and checking card/frozen-questionnaire metadata. |
| Isolated HTTP/browser regressions | 36 passed: 18 scenarios at both viewports, including all ten first-pass scenarios. |
| Inherited browser smoke | 4 passed. |
| ORM adapter compatibility | Passed. |
| Built API process restart | Same persisted session identity/deadline, survey, own answers and results after actual stop/start; no migration/reseed between starts. |

**115 selected automated tests passed**, with no failures/skips in the final listed suites. Build/typecheck/ORM/restart are separate checks, not additional counted tests. This is author-executed verification, not independently reproduced human acceptance or exhaustive planned STS/AC execution. The exact source and all twelve command outcomes are in the [safe result snapshot](pr36-second-pass-verification.json). Raw local outputs are ignored `.local/evidence/pr36-pass2-final-*.txt`; they are local evidence, not published attachments.

## Genuine failure observations and boundaries

Before modifying application code, the first six new isolated browser scenarios ran against `0ed97a4` in the wide viewport and all six failed: missing unknown-outcome handling, absent navigation/transition dialogs, and missing card context. The real N4 API regression then failed with HTTP 200 instead of 422 for an explicitly empty lectureId (one failed / twenty not selected). These runs are local before/after observations, not fabricated historical RED commits.

During implementation, typecheck caught a duplicated JSX attribute introduced while editing; it was corrected. A preliminary browser run was disturbed by that live source edit and reported one detached-element failure / 31 passes. That preliminary run is not passing evidence. The complete final matrix was run afterward on the immutable source commit recorded above with no live source edits; all 36 isolated browser cases passed. No test retries were introduced, assertions weakened or cases removed.

Only new opted-in synthetic databases in the task-created `lectra-pr36-pass2` container were used, with private ignored mode-0600 configuration. The container was removed after verification; existing user databases/containers were not reset or migrated. No credentials or tokens are recorded in the public evidence.

The existing PDF and original report snapshot still describe the earlier pre-review `1f7ae02` candidate. They were not regenerated here and must not be relabelled as evidence for this source. Renewed human review, remaining test dispositions, teammate reproduction and actual release/report gates under #22–#26 remain separate work.
