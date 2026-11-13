# Unsupported-mode own-readback correction

PR46-DEF-01 is a defensive Sprint 1 contract gap (AC-F04-22 / TEST-F04-I10), even though the production database currently permits IDENTIFIED only. This correction does not enable Anonymous Mode.

The real PostgreSQL regression at eef5e75 reproduced 3 passed / 2 failed. The two failures returned own answers from synthetic ANONYMOUS Published and Closed surveys. At 609bbcd36d3d3a5baeb9829ed9d36876ec5fe17e, the authorized readback rejects unsupported modes with 409 MODE_NOT_SUPPORTED before reading participation or answers. Unsubmitted eligible respondents also receive 409; ineligible respondents retain safe 404, owners retain 403, and persisted answer snapshots remain unchanged.

Actual verification: 5 post-release contract cases, 41 API/PostgreSQL feature cases and 7 release/PostgreSQL cases passed (53 selected tests); typecheck, build and built-process restart passed. No full historical 214-test or browser rerun is claimed. Raw output and source hashes are retained alongside this record. Environments were newly created task-owned PostgreSQL databases. Only isolated test fixtures extend the enum.

The existing sprint-1 tag and its 214-pass historical result remain unchanged. This is candidate correction evidence pending actual teammate review/integration, not a statement that the assessed main release already contains this fix.
