## Problem and resulting behavior

Describe the concrete problem and what changes for the user or reviewer.

## Scope and traceability

- Related Issues: TBD. Use `Refs` for partial/umbrella work; do not claim an entire tracker is complete.
- Feature / FR / BR / NFR / AC references: TBD, or N/A with a reason.
- Contract / STS / Product DoD and their recorded preimplementation versions: TBD, or N/A for an explained documentation-only change.
- PR base: `staging` for bounded feature/fix/docs work; `main` only for a separately authorized reviewed release from staging.
- Affected UI / API / data / configuration layers: TBD. Identify unchanged layers when relevant.
- Exclusions and known incomplete work: TBD.

## Validation actually performed

Record real results. Replace TBD; use Not run or N/A with a reason rather than inventing PASS or hiding failures/skips.

| Check / level | Command or method | Tested commit / version | Actual files / test names and result / counts |
| --- | --- | --- | --- |
| TBD | TBD | TBD | Not run — explain before review. |

For meaningful rule/defect/change work, link the actual failing intended-behavior test before correction and the passing version afterward. Include relevant setup/assertion/results; do not reconstruct history or weaken tests. Documentation-only checks are not application tests.

## Author readiness

- [ ] The bounded scope and applicable recorded contract/AC/STS match the diff; justified changes and limitations are disclosed.
- [ ] Appropriate verification was run and inspected, or any Not run/N/A case is explicitly explained above.
- [ ] Relevant backend role/ownership/eligibility, negative/boundary/concurrency and real persistence checks are included where applicable.
- [ ] Setup/migrations/seed/configuration/documents and evidence mappings are current where affected; no real secrets or student data are exposed.
- [ ] Actual pair work and AI assistance are described accurately where relevant; no contribution or review is invented.
- [ ] The actual teammate review is still required; submitting this PR does not count as approval or authorize merge.

## Reviewer handoff

- Actual PR author: TBD.
- Planned opposite-member reviewer: TBD. A planned name is not a submitted request, review or approval.
- Specific behaviors, test assertions, risks and evidence the reviewer should inspect: TBD.
- Actual human review reference: Pending. The reviewer records a concrete check/question/finding/reason; the author/AI must not fill in a fabricated approval.

## Release-only context

For ordinary bounded PRs, mark this section N/A. For an authorized staging→main release, link integrated feature/review evidence, actual system/acceptance results, setup/readiness and known limitations. After the authorized merge, retain the immutable assessed release SHA/tag and build/test evidence on that actual version. Do not invent a future merge/tag or silently replace tested code.

- Release Issue / readiness reference: N/A or TBD.
- Integrated tested staging version and observed checks: N/A or TBD.
- Accepted main release / post-merge verification: Pending for a release PR; N/A otherwise.
