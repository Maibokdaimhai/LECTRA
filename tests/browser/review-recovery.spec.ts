import { test, expect, type Page } from '@playwright/test';
// Isolated HTTP fixtures exercise the real React UI. These are not database/API acceptance tests.
const scale = { min: 1, max: 5, minLabel: 'Low', maxLabel: 'High', interpretation: 'Higher means clearer' };
const question = { id: 'q1', prompt: 'Clarity', type: 'RATING', required: true, ratingScale: scale };
const definition = () => ({ id: 'survey', lectureId: 'lecture', title: 'Persisted title', status: 'DRAFT', mode: 'IDENTIFIED', definitionRevision: 1, context: { course: { code: 'CPE334' }, section: { sectionCode: 'A' }, lecture: { title: 'Lecture', lectureDate: '2026-11-09' } }, questions: [question], privacyDisclosure: 'Identified fixture.' });
async function fixture(page: Page, respondent = false) {
    if (!/^N[23]:/.test(test.info().title)) page.on('dialog', dialog => dialog.accept());
    let stored = { ...definition(), status: respondent ? 'PUBLISHED' : 'DRAFT' }, missing = false, sessionUser: { id: string; displayName: string; role: string } | null = { id: respondent ? 'student' : 'owner', displayName: 'Fixture user', role: respondent ? 'RESPONDENT' : 'OWNER' };
    let mutation: 'ok' | 'conflict' | 'lost' = 'ok', readsFail = false, mutations = 0, lastPatch: any = null;
    let submissionReadFails = false, responseOutcome: 'ok' | 'lost-committed' | 'lost-uncommitted' | 'closed' = 'ok';
    let submission = { surveyId: 'survey', submitted: false, answers: null as { questionId: string; value: number }[] | null };
    await page.route('**/api/**', async route => {
        const req = route.request(), path = new URL(req.url()).pathname;
        const send = (data: unknown, status = 200) => route.fulfill({ status, json: { data } });
        if (path === '/api/health') return send({ status: 'ok' });
        if (path === '/api/auth/session') return send({ authenticated: !!sessionUser, user: sessionUser, csrfToken: 'fixture', expiresAt: null });
        if (path === '/api/surveys/survey/my-submission') {
            if (submissionReadFails) return route.fulfill({ status: 503, json: { error: { code: 'SERVICE_UNAVAILABLE', message: 'Unavailable' } } });
            return send(submission);
        }
        if (path === '/api/surveys/survey/responses') {
            mutations++;
            if (responseOutcome === 'closed') return route.fulfill({ status: 409, json: { error: { code: 'INVALID_STATE', message: 'Collection has ended.' } } });
            if (responseOutcome !== 'lost-uncommitted') submission = { ...submission, submitted: true, answers: req.postDataJSON().answers };
            if (responseOutcome !== 'ok') return route.abort('failed');
            return send(submission, 201);
        }
        if (path === '/api/surveys/survey' && req.method() === 'GET') {
            if (missing) return route.fulfill({ status: 404, json: { error: { code: 'NOT_FOUND', message: 'Unavailable' } } });
            if (readsFail) return route.fulfill({ status: 503, json: { error: { code: 'SERVICE_UNAVAILABLE', message: 'Unavailable' } } });
            return send(stored);
        }
        if (req.method() !== 'GET') {
            mutations++;
            if (req.method() === 'PATCH') lastPatch = req.postDataJSON();
            if (req.method() === 'PATCH' && lastPatch.expectedRevision !== stored.definitionRevision) return route.fulfill({ status: 409, json: { error: { code: 'REVISION_CONFLICT', message: 'Revision changed' } } });
            if (mutation === 'conflict') return route.fulfill({ status: 409, json: { error: { code: 'REVISION_CONFLICT', message: 'Revision changed' } } });
            if (req.method() === 'DELETE') missing = true;
            if (req.method() === 'PATCH') stored = { ...stored, ...req.postDataJSON(), definitionRevision: stored.definitionRevision + 1 };
            if (path.endsWith('/publish')) stored = { ...stored, status: 'PUBLISHED' };
            if (path.endsWith('/close')) stored = { ...stored, status: 'CLOSED' };
            if (mutation === 'lost') return route.abort('failed');
            if (req.method() === 'DELETE') return route.fulfill({ status: 204 });
            return send(stored);
        }
        if (path === '/api/courses') return send({ items: [{ id: 'course', code: 'CPE334' }], pagination: { total: 1, limit: 20, offset: 0 } });
        if (path === '/api/sections') return send({ items: [{ id: 'section', sectionCode: 'A' }], pagination: { total: 1, limit: 20, offset: 0 } });
        if (path === '/api/sections/section/lectures') return send({ items: [{ id: 'lecture', title: 'Lecture', ...(mutations ? { existingSurvey: { id: 'survey' } } : {}) }], pagination: { total: 1, limit: 20, offset: 0 } });
        if (path.endsWith('/results')) return send({ responseCount: 0 });
        return send({ items: path === '/api/surveys' && !missing ? [{ id: 'survey', title: stored.title, status: stored.status, mode: stored.mode, ...stored.context }] : [], pagination: { total: 1, limit: 20, offset: 0 } });
    });
    await page.goto('/');
    await page.getByRole('button', { name: 'Open survey', exact: true }).click();
    return { setStored: (value: Partial<typeof stored>) => { stored = { ...stored, ...value }; }, setMutation: (value: typeof mutation) => { mutation = value; }, failReads: (value: boolean) => { readsFail = value; }, setUser: (value: typeof sessionUser) => { sessionUser = value; }, mutations: () => mutations, lastPatch: () => lastPatch, setSubmissionFailure: (outcome: typeof responseOutcome, failRead: boolean) => { responseOutcome = outcome; submissionReadFails = failRead; } };
}
async function revalidate(page: Page) {
    const response = page.waitForResponse(r => new URL(r.url()).pathname === '/api/auth/session');
    await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' }); document.dispatchEvent(new Event('visibilitychange')); });
    await response;
    await expect(page.getByText('Checking your session…', { exact: true })).not.toBeVisible();
}
test('R1: same-identity background check retains unsaved owner inputs; confirmed account change clears them', async ({ page }) => {
    const f = await fixture(page);
    await page.getByLabel('Survey title', { exact: true }).fill('My unsaved title');
    await page.getByLabel('Prompt', { exact: true }).fill('My unsaved prompt');
    await revalidate(page);
    await expect(page.getByLabel('Survey title', { exact: true })).toHaveValue('My unsaved title');
    await expect(page.getByLabel('Prompt', { exact: true })).toHaveValue('My unsaved prompt');
    f.setUser(null);
    await revalidate(page);
    await expect(page.getByRole('heading', { name: 'Log in', exact: true })).toBeVisible();
    await expect(page.getByLabel('Survey title', { exact: true })).toHaveCount(0);
});
test('R2: conflict preserves local edits, reads persisted revision, and requires explicit reapply before saving', async ({ page }) => {
    const f = await fixture(page);
    await page.getByLabel('Survey title', { exact: true }).fill('My retained title');
    f.setStored({ title: 'Other tab title', definitionRevision: 2, questions: [{ ...question, id: 'replacement-question' }] }); f.setMutation('conflict');
    await page.getByRole('button', { name: 'Save draft', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Save draft', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Check persisted draft', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Persisted draft', exact: true })).toContainText('Other tab title');
    await expect(page.getByLabel('Survey title', { exact: true })).toHaveValue('My retained title');
    await page.getByRole('button', { name: 'Reapply my edits to revision 2', exact: true }).click();
    expect(f.mutations()).toBe(1);
    f.setMutation('ok');
    await page.getByRole('button', { name: 'Save draft', exact: true }).click();
    await expect(page.getByText('Saved revision 3.', { exact: true })).toBeVisible();
    expect(f.lastPatch().expectedRevision).toBe(2);
    expect(f.lastPatch().questions[0].id).toBeNull();
});
test('R2: committed save with lost response retains edits and recovers through persisted read, without replay', async ({ page }) => {
    const f = await fixture(page);
    await page.getByLabel('Survey title', { exact: true }).fill('Saved but response lost'); f.setMutation('lost');
    await page.getByRole('button', { name: 'Save draft', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Save draft', exact: true })).toBeDisabled();
    f.failReads(true);
    await page.getByRole('button', { name: 'Check persisted draft', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('SERVICE_UNAVAILABLE');
    await expect(page.getByLabel('Survey title', { exact: true })).toHaveValue('Saved but response lost');
    f.failReads(false);
    await page.getByRole('button', { name: 'Check persisted draft', exact: true }).click();
    await page.getByRole('button', { name: 'Use persisted draft', exact: true }).click();
    await expect(page.getByText('Saved revision 2.', { exact: true })).toBeVisible();
    expect(f.mutations()).toBe(1);
});
test('R2/R4: uncertain publication checks persisted state and exposes frozen questionnaire without replay', async ({ page }) => {
    const f = await fixture(page); f.setMutation('lost');
    await page.getByRole('button', { name: 'Publish survey', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Publish survey', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Check persisted survey', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Frozen questionnaire', exact: true })).toContainText('Clarity');
    await expect(page.getByRole('region', { name: 'Frozen questionnaire', exact: true })).toContainText('Higher means clearer');
    await expect(page.getByRole('button', { name: 'Close survey', exact: true })).toBeEnabled();
    expect(f.mutations()).toBe(1);
});

test('R1: background session service failure retains edits and gates mutations until successful reconnect', async ({ page }) => {
    await fixture(page);
    await page.getByLabel('Survey title', { exact: true }).fill('Retained during outage');
    await page.route('**/api/auth/session', route => route.fulfill({ status: 503, json: { error: { code: 'SERVICE_UNAVAILABLE', message: 'Unavailable' } } }));
    await revalidate(page);
    await expect(page.getByLabel('Survey title', { exact: true })).toHaveValue('Retained during outage');
    await expect(page.getByRole('button', { name: 'Save draft', exact: true })).toBeDisabled();
    await page.unroute('**/api/auth/session');
    await page.getByRole('button', { name: 'Check session / reconnect', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Save draft', exact: true })).toBeEnabled();
    await expect(page.getByLabel('Survey title', { exact: true })).toHaveValue('Retained during outage');
});
test('R1: respondent selection remains after same-identity revalidation', async ({ page }) => {
    await fixture(page, true);
    await page.getByRole('radio', { name: '4', exact: true }).check();
    await revalidate(page);
    await expect(page.getByRole('radio', { name: '4', exact: true })).toBeChecked();
    await expect(page.getByRole('button', { name: 'Submit feedback', exact: true })).toBeEnabled();
});
test('R2: publication conflict reloads the authoritative Draft revision before an explicit retry', async ({ page }) => {
    const f = await fixture(page);
    f.setStored({ title: 'Changed by another tab', definitionRevision: 2 }); f.setMutation('conflict');
    await page.getByRole('button', { name: 'Publish survey', exact: true }).click();
    await page.getByRole('button', { name: 'Check persisted survey', exact: true }).click();
    await expect(page.getByLabel('Survey title', { exact: true })).toHaveValue('Changed by another tab');
    await expect(page.getByText('Saved revision 2.', { exact: true })).toBeVisible();
    expect(f.mutations()).toBe(1);
});
test('R2/R4: lost close response recovers Closed read-only questionnaire without replay', async ({ page }) => {
    const f = await fixture(page);
    await page.getByRole('button', { name: 'Publish survey', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Frozen questionnaire', exact: true })).toBeVisible();
    f.setMutation('lost');
    await page.getByRole('button', { name: 'Close survey', exact: true }).click();
    await page.getByRole('button', { name: 'Check persisted survey', exact: true }).click();
    await expect(page.getByText('CLOSED', { exact: true })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Frozen questionnaire', exact: true })).toContainText('Required');
    await expect(page.getByRole('button', { name: 'Close survey', exact: true })).toHaveCount(0);
    expect(f.mutations()).toBe(2);
});
test('R2: lost delete response reconciles a persisted 404 to the list without replay', async ({ page }) => {
    const f = await fixture(page); f.setMutation('lost');
    await page.getByRole('button', { name: 'Delete draft', exact: true }).click();
    await page.getByRole('button', { name: 'Check persisted survey', exact: true }).click();
    await expect(page.getByText('No surveys available.', { exact: true })).toBeVisible();
    expect(f.mutations()).toBe(1);
});

test('R2: uncertain create checks the lecture and opens its persisted survey without creating twice', async ({ page }) => {
    const f = await fixture(page);
    await page.getByRole('button', { name: 'Back to survey list', exact: true }).click();
    await page.getByLabel('Course', { exact: true }).selectOption('course');
    await page.getByLabel('Section', { exact: true }).selectOption('section');
    await page.getByLabel('Lecture', { exact: true }).selectOption('lecture');
    f.setMutation('lost');
    await page.getByRole('button', { name: 'Create draft', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Create draft', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Check persisted lecture', exact: true }).click();
    await expect(page.getByLabel('Survey title', { exact: true })).toHaveValue('Persisted title');
    expect(f.mutations()).toBe(1);
});

test('N1: uncertain committed submission remains blocked until saved status succeeds', async ({ page }) => {
    const f = await fixture(page, true);
    await page.getByRole('radio', { name: '4', exact: true }).check();
    f.setSubmissionFailure('lost-committed', true);
    await page.getByRole('button', { name: 'Submit feedback', exact: true }).click();
    await expect(page.getByText('Submission outcome unknown. Check saved status before trying again.', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit feedback', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Check saved status', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Submit feedback', exact: true })).toBeDisabled();
    await expect(page.getByRole('radio', { name: '4', exact: true })).toBeChecked();
    f.setSubmissionFailure('ok', false);
    await page.getByRole('button', { name: 'Check saved status', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Submission received', exact: true })).toBeVisible();
    expect(f.mutations()).toBe(1);
});
test('N1: an explicit successful not-submitted read permits a deliberate retry with retained answers', async ({ page }) => {
    const f = await fixture(page, true);
    await page.getByRole('radio', { name: '4', exact: true }).check();
    f.setSubmissionFailure('lost-uncommitted', true);
    await page.getByRole('button', { name: 'Submit feedback', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Submit feedback', exact: true })).toBeDisabled();
    f.setSubmissionFailure('ok', false);
    await page.getByRole('button', { name: 'Check saved status', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Submit feedback', exact: true })).toBeEnabled();
    expect(f.mutations()).toBe(1);
    await expect(page.getByRole('radio', { name: '4', exact: true })).toBeChecked();
    await page.getByRole('button', { name: 'Submit feedback', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Submission received', exact: true })).toBeVisible();
    expect(f.mutations()).toBe(2);
});
test('N2: back navigation requires explicit discard and cancellation retains draft inputs', async ({ page }) => {
    const f = await fixture(page);
    await page.getByLabel('Survey title', { exact: true }).fill('Do not lose this');
    const dismissed = page.waitForEvent('dialog');
    const click = page.getByRole('button', { name: 'Back to survey list', exact: true }).click();
    const dialog = await dismissed; expect(dialog.message()).toContain('Discard'); await dialog.dismiss(); await click;
    await expect(page.getByLabel('Survey title', { exact: true })).toHaveValue('Do not lose this');
    page.once('dialog', d => d.accept());
    await page.getByRole('button', { name: 'Back to survey list', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Open survey', exact: true })).toBeVisible();
    expect(f.mutations()).toBe(0);
});
test('N2: context selection cancellation retains selection and draft; acceptance discards explicitly', async ({ page }) => {
    await fixture(page);
    // Establish a selected context while there is no unsaved work.
    await page.getByLabel('Course', { exact: true }).selectOption('course');
    await page.getByRole('button', { name: 'Open survey', exact: true }).click();
    await page.getByLabel('Survey title', { exact: true }).fill('Context draft');
    const seen = page.waitForEvent('dialog');
    const change = page.getByLabel('Course', { exact: true }).selectOption('');
    const dialog = await seen; await dialog.dismiss(); await change;
    await expect(page.getByLabel('Course', { exact: true })).toHaveValue('course');
    await expect(page.getByLabel('Survey title', { exact: true })).toHaveValue('Context draft');
    page.once('dialog', d => d.accept());
    await page.getByLabel('Course', { exact: true }).selectOption('');
    await expect(page.getByLabel('Survey title', { exact: true })).toHaveCount(0);
    await expect(page.getByLabel('Course', { exact: true })).toHaveValue('');
});
test('N3: publish and close require confirmation and cancellation sends no mutation', async ({ page }) => {
    const f = await fixture(page);
    const seen = page.waitForEvent('dialog');
    const click = page.getByRole('button', { name: 'Publish survey', exact: true }).click();
    const dialog = await seen; expect(dialog.message()).toContain('freezes'); expect(dialog.message()).toContain('eligible'); await dialog.dismiss(); await click;
    expect(f.mutations()).toBe(0);
    await expect(page.getByLabel('Survey title', { exact: true })).toBeVisible();
    page.once('dialog', d => d.accept());
    await page.getByRole('button', { name: 'Publish survey', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Close survey', exact: true })).toBeVisible();
    const closing = page.waitForEvent('dialog');
    const closeClick = page.getByRole('button', { name: 'Close survey', exact: true }).click();
    const closeDialog = await closing; expect(closeDialog.message()).toContain('stops'); expect(closeDialog.message()).toContain('reopened'); await closeDialog.dismiss(); await closeClick;
    expect(f.mutations()).toBe(1);
    page.once('dialog', d => d.accept());
    await page.getByRole('button', { name: 'Close survey', exact: true }).click();
    await expect(page.getByText('CLOSED', { exact: true })).toBeVisible();
    expect(f.mutations()).toBe(2);
});
test('N5: survey card exposes course, section, lecture date and mode', async ({ page }) => {
    await fixture(page);
    await page.getByRole('button', { name: 'Back to survey list', exact: true }).click();
    const card = page.getByRole('listitem').filter({ hasText: 'Persisted title' });
    await expect(card).toContainText('CPE334');
    await expect(card).toContainText('Section A');
    await expect(card).toContainText('2026-11-09');
    await expect(card).toContainText('IDENTIFIED');
});

test('N2: Section and Lecture changes each require explicit discard before unmounting the draft', async ({ page }) => {
    await fixture(page);
    await page.getByLabel('Course', { exact: true }).selectOption('course');
    await page.getByLabel('Section', { exact: true }).selectOption('section');
    await page.getByLabel('Lecture', { exact: true }).selectOption('lecture');
    await page.getByRole('button', { name: 'Open survey', exact: true }).click();
    await page.getByLabel('Survey title', { exact: true }).fill('Retain across context');
    for (const [label, value] of [['Section', 'section'], ['Lecture', 'lecture']]) {
        page.once('dialog', d => d.dismiss());
        await page.getByLabel(label!, { exact: true }).selectOption('');
        await expect(page.getByLabel(label!, { exact: true })).toHaveValue(value!);
        await expect(page.getByLabel('Survey title', { exact: true })).toHaveValue('Retain across context');
    }
    page.once('dialog', d => d.accept());
    await page.getByLabel('Lecture', { exact: true }).selectOption('');
    await expect(page.getByLabel('Survey title', { exact: true })).toHaveCount(0);
});
test('N3: Draft deletion also respects the existing contract confirmation', async ({ page }) => {
    const f = await fixture(page);
    page.once('dialog', d => d.dismiss());
    await page.getByRole('button', { name: 'Delete draft', exact: true }).click();
    expect(f.mutations()).toBe(0);
    await expect(page.getByLabel('Survey title', { exact: true })).toBeVisible();
    page.once('dialog', d => d.accept());
    await page.getByRole('button', { name: 'Delete draft', exact: true }).click();
    await expect(page.getByText('No surveys available.', { exact: true })).toBeVisible();
    expect(f.mutations()).toBe(1);
});

test('DEF-B23-01: failed lifecycle and status reads stay blocked until explicit reconciliation', async ({ page }) => {
    const f = await fixture(page, true);
    await page.getByRole('radio', { name: '4', exact: true }).check();
    f.setStored({ status: 'CLOSED' }); f.setSubmissionFailure('closed', false); f.failReads(true);
    await page.getByRole('button', { name: 'Submit feedback', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Submit feedback', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Check saved status', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('SERVICE_UNAVAILABLE');
    await expect(page.getByRole('button', { name: 'Submit feedback', exact: true })).toBeDisabled();
    f.failReads(false);
    f.setSubmissionFailure('closed', true);
    await page.getByRole('button', { name: 'Check saved status', exact: true }).click();
    await expect(page.getByText('CLOSED', { exact: true })).toBeVisible();
    await expect(page.getByText('This survey is closed. Check saved status to confirm whether your submission was recorded.', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit feedback', exact: true })).toHaveCount(0);
    f.setSubmissionFailure('closed', false);
    await page.getByRole('button', { name: 'Check saved status', exact: true }).click();
    await expect(page.getByText('This survey is closed. No submission was recorded for your account.', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit feedback', exact: true })).toHaveCount(0);
    expect(f.mutations()).toBe(1);
});
