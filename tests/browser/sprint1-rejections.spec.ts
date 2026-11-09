import { test, expect, signIn, createSurvey, openSurvey, confirmAction, read, screenshot } from './support/real-app.js';

test('B23-03 genuine stale forms reject duplicate and Closed submissions without extra rows', async ({ page: owner, browser, data }, info) => {
  await signIn(owner);
  const survey = await createSurvey(owner, await data.lecture(), `Rejections ${info.project.name}`);
  const path = `/api/surveys/${survey.id}`;
  const contexts = await Promise.all([1, 2, 3].map(() => browser.newContext({ viewport: info.project.use.viewport })));
  try {
    const [first, stale, later] = await Promise.all(contexts.map(c => c.newPage()));
    for (const [index, p] of [first!, stale!, later!].entries()) { await signIn(p, index === 2 ? 'respondent.12@example.test' : 'respondent.11@example.test'); await openSurvey(p, survey.title); await p.getByRole('radio', { name: '4', exact: true }).check(); }
    await first!.getByRole('button', { name: 'Submit feedback', exact: true }).click();
    await expect(first!.getByRole('heading', { name: 'Submission received' })).toBeVisible();
    const stored = await read(first!, `${path}/my-submission`);
    const duplicate = stale!.waitForResponse(r => new URL(r.url()).pathname === `${path}/responses`);
    await stale!.getByRole('button', { name: 'Submit feedback', exact: true }).click();
    const denied = await duplicate; expect(denied.status()).toBe(409); expect((await denied.json()).error.code).toBe('RESPONSE_ALREADY_SUBMITTED');
    await expect(stale!.getByRole('heading', { name: 'Submission received' })).toBeVisible();
    expect(await read(stale!, `${path}/my-submission`)).toEqual(stored);
    expect((await read(owner, `${path}/results`)).responseCount).toBe(1);
    await expect(later!.getByText('PUBLISHED', { exact: true })).toBeVisible();
    await confirmAction(owner, 'Close survey');
    await expect(owner.getByText('CLOSED', { exact: true })).toBeVisible();
    let rejectedPosts = 0;
    later!.on('request', request => { if (new URL(request.url()).pathname === `${path}/responses` && request.method() === 'POST') rejectedPosts++; });
    const closed = later!.waitForResponse(r => new URL(r.url()).pathname === `${path}/responses`);
    const lifecycle = later!.waitForResponse(r => new URL(r.url()).pathname === path && r.request().method() === 'GET');
    await later!.getByRole('button', { name: 'Submit feedback', exact: true }).click();
    const rejected = await closed; expect(rejected.status()).toBe(409); expect((await rejected.json()).error.code).toBe('INVALID_STATE');
    const refreshed = await lifecycle; expect(refreshed.status()).toBe(200); expect((await refreshed.json()).data.status).toBe('CLOSED');
    await expect(later!.getByText('CLOSED', { exact: true })).toBeVisible();
    await expect(later!.getByText('This survey is closed. No submission was recorded for your account.', { exact: true })).toBeVisible();
    await expect(later!.getByRole('alert')).toContainText('INVALID_STATE');
    expect((await read(later!, `${path}/my-submission`)).submitted).toBe(false);
    expect((await read(owner, `${path}/results`)).responseCount).toBe(1);
    expect(await data.responseRows(survey.id)).toEqual({ participation: 1, bundles: 1, answers: 1 });
    // Retain the original defect assertion, with stronger no-reload lifecycle/readback checks above.
    await expect.soft(later!.getByRole('button', { name: 'Submit feedback', exact: true }).and(later!.locator(':enabled')),
      'DEF-B23-01: an authoritative Closed rejection must remove or disable Submit').toHaveCount(0);
    await expect(later!.getByRole('button', { name: 'Submit feedback', exact: true })).toHaveCount(0);
    expect(rejectedPosts).toBe(1);
    await screenshot(later!, info, 'closed-recovered-without-reload');
    await later!.reload(); await openSurvey(later!, survey.title);
    await expect(later!.getByText('This survey is closed. No submission was recorded for your account.', { exact: true })).toBeVisible();
    await expect(later!.getByRole('button', { name: 'Submit feedback', exact: true })).toHaveCount(0);
    await screenshot(later!, info, 'closed-reloaded');
  } finally { await Promise.all(contexts.map(c => c.close())); }
});

test('B23-04 genuine browser sessions reject wrong role, foreign Course owner and guest access', async ({ page: owner, browser, data }, info) => {
  await signIn(owner);
  const survey = await createSurvey(owner, await data.lecture(true), `Private Course ${info.project.name}`, false);
  const path = `/api/surveys/${survey.id}`;
  const before = await read(owner, path);
  const contexts = await Promise.all([1, 2, 3].map(() => browser.newContext({ viewport: info.project.use.viewport })));
  try {
    const [student, foreign, guest] = await Promise.all(contexts.map(c => c.newPage()));
    await signIn(student!, 'respondent.11@example.test'); await signIn(foreign!, 'owner.2@example.test'); await guest!.goto('/');
    await expect(student!.getByRole('listitem').filter({ hasText: survey.title })).toHaveCount(0);
    await expect(foreign!.getByRole('listitem').filter({ hasText: survey.title })).toHaveCount(0);
    const roleDenied = await student!.evaluate(async target => {
      const { data } = await (await fetch('/api/auth/session')).json();
      const r = await fetch(target, { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': data.csrfToken }, body: JSON.stringify({ expectedRevision: 2 }) });
      return { status: r.status, body: await r.json() };
    }, path);
    expect(roleDenied.status).toBe(403); expect(roleDenied.body.error.code).toBe('FORBIDDEN_ROLE');
    for (const [p, code, status] of [[foreign!, 'NOT_FOUND', 404], [guest!, 'AUTH_REQUIRED', 401]] as const) {
      const denied = await p.evaluate(async target => { const r = await fetch(target); return { status: r.status, body: await r.json() }; }, path);
      expect(denied.status).toBe(status); expect(denied.body.error.code).toBe(code);
      expect(Object.keys(denied.body)).toEqual(['error']); expect(JSON.stringify(denied.body)).not.toContain(survey.title);
    }
    expect(await read(owner, path)).toEqual(before);
    expect(await data.responseRows(survey.id)).toEqual({ participation: 0, bundles: 0, answers: 0 });
    await screenshot(foreign!, info, 'foreign-owner-safe-list');
  } finally { await Promise.all(contexts.map(c => c.close())); }
});
