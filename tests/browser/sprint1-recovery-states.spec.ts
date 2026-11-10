import { test, expect, signIn, createSurvey, openSurvey, confirmAction, read, screenshot, barrier } from './support/real-app.js';

test('B23-05 real expiry clears unsaved private state and ignores a delayed older read; logout survives reload', async ({ page: owner, browser, data, realApp }, info) => {
  await signIn(owner);
  const survey = await createSurvey(owner, await data.lecture(), `Expiry ${info.project.name}`);
  const context = await browser.newContext({ viewport: info.project.use.viewport });
  const student = await context.newPage();
  const held = barrier(), release = barrier(), delivered = barrier();
  try {
    await signIn(student, 'respondent.11@example.test'); await openSurvey(student, survey.title);
    await student.getByRole('radio', { name: '4', exact: true }).check();
    const answer = student.getByRole('textbox', { name: 'Written answer for Next time', exact: true });
    await answer.fill('Private unsent expiry marker');
    await student.route(`**/api/surveys/${survey.id}/my-submission`, async route => {
      const response = await route.fetch(); // Real authorized pre-expiry snapshot, held at delivery only.
      expect(response.status()).toBe(200); held.resolve();
      await release.promise;
      try { await route.fulfill({ response }); } finally { delivered.resolve(); }
    }, { times: 1 });
    await student.getByRole('button', { name: 'Check saved status', exact: true }).click();
    await held.promise;
    realApp.advance(28_800_000);
    const expired = await student.evaluate(async () => { const r = await fetch('/api/auth/me'); return { status: r.status, code: (await r.json()).error.code }; });
    expect(expired).toEqual({ status: 401, code: 'SESSION_EXPIRED' });
    await student.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await expect(student.getByRole('heading', { name: 'Log in', exact: true })).toBeVisible();
    release.resolve(); await delivered.promise;
    await expect(student.getByText('Private unsent expiry marker', { exact: true })).toHaveCount(0);
    await expect(student.getByRole('radio')).toHaveCount(0);
    await screenshot(student, info, 'expired-private-state-cleared');
    await signIn(student, 'respondent.11@example.test'); await openSurvey(student, survey.title);
    await expect(student.getByRole('textbox', { name: 'Written answer for Next time', exact: true })).toHaveValue('');
    await student.getByRole('button', { name: 'Log out', exact: true }).click();
    await expect(student.getByRole('heading', { name: 'Log in', exact: true })).toBeVisible();
    await student.reload();
    await expect(student.getByRole('heading', { name: 'Log in', exact: true })).toBeVisible();
    const denied = await student.request.get('/api/surveys');
    expect(denied.status()).toBe(401); expect((await denied.json()).error.code).toBe('AUTH_REQUIRED');
    expect(await data.responseRows(survey.id)).toEqual({ participation: 0, bundles: 0, answers: 0 });
  } finally { release.resolve(); await context.close(); }
});

test('B23-06 real committed POST loses delivery and remains blocked until real persisted reconciliation', async ({ page: owner, browser, data }, info) => {
  await signIn(owner);
  const survey = await createSurvey(owner, await data.lecture(), `Uncertain ${info.project.name}`);
  const path = `/api/surveys/${survey.id}`;
  const context = await browser.newContext({ viewport: info.project.use.viewport });
  const student = await context.newPage();
  try {
    await signIn(student, 'respondent.11@example.test'); await openSurvey(student, survey.title);
    await student.getByRole('radio', { name: '4', exact: true }).check();
    let posts = 0, committedStatus = 0, unavailable = true;
    await student.route(`**${path}/my-submission`, route => unavailable ? route.abort('failed') : route.continue());
    await student.route(`**${path}/responses`, async route => {
      posts++;
      const committed = await route.fetch(); // Actual server transaction; never fulfil a synthetic 201.
      committedStatus = committed.status();
      await route.abort('failed');
    });
    await student.getByRole('button', { name: 'Submit feedback', exact: true }).click();
    await expect(student.getByText('Submission outcome unknown. Check saved status before trying again.', { exact: true })).toBeVisible();
    expect(committedStatus).toBe(201); expect(posts).toBe(1);
    await expect(student.getByRole('button', { name: 'Submit feedback', exact: true })).toBeDisabled();
    await expect(student.getByRole('radio', { name: '4', exact: true })).toBeChecked();
    await student.getByRole('button', { name: 'Check saved status', exact: true }).click();
    await expect(student.getByRole('alert')).toBeVisible();
    await expect(student.getByRole('button', { name: 'Submit feedback', exact: true })).toBeDisabled();
    await screenshot(student, info, 'unknown-outcome-blocked');
    unavailable = false;
    await student.getByRole('button', { name: 'Check saved status', exact: true }).click();
    await expect(student.getByRole('heading', { name: 'Submission received' })).toBeVisible();
    const stored = await read(student, `${path}/my-submission`);
    expect(stored.answers).toEqual([{ questionId: survey.questions[0].id, value: 4 }]);
    expect(posts).toBe(1); expect((await read(owner, `${path}/results`)).responseCount).toBe(1);
    expect(await data.responseRows(survey.id)).toEqual({ participation: 1, bundles: 1, answers: 1 });
    await screenshot(student, info, 'real-uncertain-outcome-recovered');
  } finally { await context.close(); }
});

test('B23-07 real empty contexts and zero results distinguish held loading, delivery error and successful retry', async ({ page, data }, info) => {
  await signIn(page, 'owner.3@example.test');
  await expect(page.getByText('No course available.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Log out', exact: true }).click();
  await signIn(page, 'respondent.14@example.test');
  await expect(page.getByText('No surveys available.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Log out', exact: true }).click();
  await signIn(page);
  const survey = await createSurvey(page, await data.lecture(), `Zero ${info.project.name}`);
  await confirmAction(page, 'Close survey');
  await expect(page.getByText('CLOSED', { exact: true })).toBeVisible();
  await expect(page.getByText('Responses: 0', { exact: true })).toBeVisible();
  const path = `/api/surveys/${survey.id}/results`;
  const empty = await read(page, path);
  expect(empty.responseCount).toBe(0); expect(empty.questions[0].mean).toBeNull();
  expect(empty.questions[0].distribution.map((b: { count: number }) => b.count)).toEqual([0, 0, 0, 0, 0]);
  await expect(page.getByText('No answers', { exact: true })).toBeVisible();
  const held = barrier(), release = barrier();
  await page.route(`**${path}`, async route => { const actual = await route.fetch(); held.resolve(); await release.promise; await route.fulfill({ response: actual }); }, { times: 1 });
  try {
    await page.getByRole('button', { name: 'Refresh results', exact: true }).click(); await held.promise;
    await expect(page.getByText('Loading results…', { exact: true })).toBeVisible();
    await expect(page.getByText('Responses: 0', { exact: true })).toHaveCount(0);
    await screenshot(page, info, 'results-loading');
  } finally { release.resolve(); }
  await expect(page.getByText('Responses: 0', { exact: true })).toBeVisible();
  await page.route(`**${path}`, route => route.abort('failed'), { times: 1 });
  await page.getByRole('button', { name: 'Refresh results', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByText('Responses: 0', { exact: true })).toHaveCount(0);
  await screenshot(page, info, 'results-delivery-error');
  await page.getByRole('button', { name: 'Refresh results', exact: true }).click();
  await expect(page.getByText('Responses: 0', { exact: true })).toBeVisible();
  const bins = page.getByRole('table').getByRole('row');
  for (let i = 1; i <= 5; i++) await expect(bins.nth(i).getByRole('cell').first()).toHaveText('0');
  expect(await data.responseRows(survey.id)).toEqual({ participation: 0, bundles: 0, answers: 0 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await screenshot(page, info, 'zero-results-recovered');
});
