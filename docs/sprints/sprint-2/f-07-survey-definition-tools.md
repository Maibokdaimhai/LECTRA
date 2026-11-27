# F-07 Starter, copy, single choice and eligibility subset

Deliverable 2 contract v0.1, 27 November 2026. Proposed for teammate review. Requirements FR-03/09/12/13, BR-02/03/05/07/09/16–18/23, NFR-01/03/07/09. Keep existing Draft creation and older full-membership behavior.

## Design and workflow

- Add owner-only Starter preview displaying immutable template key and version. Seed lecture-feedback version 1 with content clarity, explanation effectiveness, classroom suitability and one optional General Suggestions text question. Use the exact prompts, anchors and required flags from the SRS starter table. Preview must show the version and required state. Restrict initial starter use to identified Drafts until the anonymous text policy is resolved. Blank Draft remains available.
- Extend Draft creation with one optional source, either an exact starter key/version or owned source survey ID/expected definition revision. Target lecture must be owned and unoccupied. Resolve source within the same database transaction. Lock a source survey when taking the snapshot and reject a stale revision. Generate independent survey, question and choice IDs. Preserve source provenance and supported metric-definition versions. Copy definition fields only. The target Draft uses its own mode and eligibility settings. Publish continues to validate the new Draft.
- Add SINGLE_CHOICE to the versioned question schema with immutable post-publication ordered options. Accept 2–6 labels, each 1–120 Unicode code points after trim, distinct after trim and case-insensitive comparison. Persist one selected option ID belonging to the answered question. Required unanswered questions reject. Closed results use per-option counts with no mean and reuse the F-06 privacy projection.
- The Draft editor supports title, type, required flag, option order and question order. Adopt the existing optimistic Draft revision so every edit or subset change uses one authoritative snapshot. An explicit subset stores distinct Section-member IDs. An unset selection keeps all Section members. Publication revalidates current membership, rejects an empty eligible result and freezes the resulting eligibility snapshot. Member changes after publication do not alter it. Never expose the member list to students.
- Store provenance for fixed comparable rating metrics. An edit to wording, type or anchors clears the inherited metric reference. A manual prompt/category match does not assign one. No template-management role is required.
- Keep any additive constraints compatible with current identified data. Return 404 for cross-owner source/target, 409 for occupied lecture or stale definition, 422 for invalid options/subset. Never copy responses, existing eligibility, timestamps, results or notes.

## Acceptance and STS

| AC | Planned test and level | Input and preconditions | Expected result |
| --- | --- | --- | --- |
| AC-F07-01 FR-12/13 | TEST-F07-I01 API/DB, E01 UI | Fresh seed, owner previews v1 and applies it. | Four defined categories, version displayed, independent Draft persists on reopen. |
| AC-F07-02 BR-17/23 | TEST-F07-I02 API/DB | Owned source, unused owned lecture, concurrent copy/create, stale revision, wrong owner. | One new survey, all new IDs, only definition data. Stale or occupied conflicts and foreign records deny. |
| AC-F07-03 FR-09 BR-05/07/16 | TEST-F07-U01 unit, I03 API/DB, E02 UI | Option counts 1/2/6/7, duplicate labels and forged option IDs. | Exactly 2–6 valid options, one valid saved choice, correct count and no mean after close. |
| AC-F07-04 FR-09 BR-02/03/09 | TEST-F07-I04 API/DB, E03 UI | Subset includes valid member, outsider, duplicate, and member removed before publish. | Only valid nonempty snapshot publishes and later membership edits have no effect. Student cannot read subset. |
| AC-F07-05 BR-17/18 NFR-09 | TEST-F07-I05 API/DB | Edit copied wording, anchors and option labels, and refresh the original. | New IDs isolate edits. Incompatible rating clears metric reference. Original remains byte-for-byte equivalent in readback. |
| AC-F07-06 FR-03 NFR-07 | TEST-F07-E04 UI | Keyboard draft edit at 360 and 1280 pixels, including invalid option. | Can order questions/options, identify error, fix and save. Existing blank Draft workflow still works. |

**Done when** starter wording and scopes are reviewed, migration/seed and DB copy/submit regressions pass, UI evidence shows actual saved data, teammate-reviewed PR integrates with F-06/F-08, and the accepted release records the tested version.
