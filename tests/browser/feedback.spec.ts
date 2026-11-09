import { test, expect, type Page } from '@playwright/test';
test.beforeEach(async ({ page }) => { page.on('dialog', dialog => dialog.accept()); });
async function signIn(page: Page, email: string) {
    await page.getByLabel('Email', { exact: true }).fill(email);
    await page.getByLabel('Password', { exact: true }).fill(email.startsWith('respondent.') ? process.env.SEED_RESPONDENT_PASSWORD! : process.env.SEED_OWNER_PASSWORD!);
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Log out', exact: true })).toBeVisible();
}
test('real owner → student → closed results, persistent readback, rejection and safe text at selected viewport', async ({ page }, info) => {
    await page.goto('/');
    await signIn(page, 'owner.1@example.test');
    await page.getByLabel('Course', { exact: true }).selectOption({ label: 'SYN-CPE334' });
    await page.getByLabel('Section', { exact: true }).selectOption({ label: 'A' });
    const narrow = info.project.name === 'chromium-narrow';
    await page.getByLabel('Lecture', { exact: true }).selectOption({ label: narrow ? 'Synthetic lecture one · Lecture 1' : 'Synthetic lecture two · Lecture 2' });
    if (!narrow)
        await page.getByRole('button', { name: 'Create draft', exact: true }).click();
    await page.getByLabel('Survey title', { exact: true }).fill(`Browser ${info.project.name}`);
    if (!narrow) {
        await page.getByRole('button', { name: 'Add question', exact: true }).click();
    }
    const first = page.getByRole('group', { name: 'Question 1', exact: true });
    await first.getByLabel('Prompt', { exact: true }).fill('Understanding');
    await first.getByLabel('Score 1 label', { exact: true }).fill('Low');
    await first.getByLabel('Score 5 label', { exact: true }).fill('High');
    await first.getByLabel('Scale interpretation', { exact: true }).fill('Higher means clearer');
    if (!narrow)
        await page.getByRole('button', { name: 'Add question', exact: true }).click();
    const second = page.getByRole('group', { name: 'Question 2', exact: true });
    await second.getByRole('combobox', { name: 'Question type', exact: true }).selectOption('TEXT');
    await second.getByLabel('Prompt', { exact: true }).fill('Next time');
    await second.getByLabel('Required', { exact: true }).uncheck();
    await page.getByRole('button', { name: 'Save draft', exact: true }).click();
    await expect(page.getByText('Saved revision 2.', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Publish survey', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Close survey', exact: true })).toBeVisible();
    const frozen = page.getByRole('region', { name: 'Frozen questionnaire', exact: true });
    await expect(frozen).toContainText('Understanding');
    await expect(frozen).toContainText('Higher means clearer');
    await expect(frozen).toContainText('Next time');
    await expect(frozen).toContainText('Optional');
    await expect(frozen.locator('input, textarea, select')).toHaveCount(0);
    await expect(page.getByText('Scores and written feedback become available after closing.', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Log out', exact: true }).click();
    await signIn(page, 'respondent.11@example.test');
    const row = page.getByRole('listitem').filter({ hasText: `Browser ${info.project.name}` });
    await expect(row).toContainText('SYN-CPE334');
    await expect(row).toContainText('Section A');
    await expect(row).toContainText('2026-11-08');
    await expect(row).toContainText('IDENTIFIED');
    await row.getByRole('button', { name: 'Open survey', exact: true }).click();
    await expect(page.getByText(/This survey is identified\./)).toBeVisible();
    // Server-required validation preserves the user's unsent text.
    const answer = page.getByRole('textbox', { name: 'Written answer for Next time', exact: true });
    await answer.fill('<script>window.feedbackExecuted=true</script> More examples.');
    await page.getByRole('button', { name: 'Submit feedback', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('INVALID_ANSWERS');
    await expect(answer).toHaveValue('<script>window.feedbackExecuted=true</script> More examples.');
    await page.getByRole('radio', { name: '5', exact: true }).check();
    await page.getByRole('button', { name: 'Submit feedback', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Submission received', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.reload();
    await row.getByRole('button', { name: 'Open survey', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Submission received', exact: true })).toBeVisible();
    await page.screenshot({ path: `.local/evidence/submission-${info.project.name}.png` });
    await page.getByRole('button', { name: 'Log out', exact: true }).click();
    await signIn(page, 'owner.1@example.test');
    await row.getByRole('button', { name: 'Open survey', exact: true }).click();
    await page.getByRole('button', { name: 'Close survey', exact: true }).click();
    await expect(frozen).toContainText('Understanding');
    await expect(frozen.locator('input, textarea, select')).toHaveCount(0);
    await expect(page.getByText('5.00', { exact: true })).toBeVisible();
    await expect(page.getByText('<script>window.feedbackExecuted=true</script> More examples.', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => ('feedbackExecuted' in window))).toBe(false);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `.local/evidence/results-${info.project.name}.png` });
});
test('bootstrap uses one real session request under React StrictMode and supports keyboard login', async ({ page }) => {
    let bootstraps = 0;
    page.on('request', request => { if (new URL(request.url()).pathname === '/api/auth/session')
        bootstraps++; });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Log in', exact: true })).toBeEnabled();
    expect(bootstraps).toBe(1);
    await page.getByLabel('Email', { exact: true }).fill('owner.1@example.test');
    await page.getByLabel('Password', { exact: true }).fill(process.env.SEED_OWNER_PASSWORD!);
    await page.getByLabel('Password', { exact: true }).press('Enter');
    await expect(page.getByRole('button', { name: 'Log out', exact: true })).toBeVisible();
});
