import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});

test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});

test.describe('ウェルカムページの表示確認', () => {
  test('未ログイン状態の要素が正しく表示されていること', async ({ page }) => {
    // 1. ウェルカムページへアクセス
    await page.goto('http://localhost:3000/welcome');

    // 2. タイトル（h1）に「診療材料新規採用申請システム」が表示されているか確認
    const heading = page.getByRole('heading', {
      name: '診療材料新規採用申請システム',
    });
    await expect(heading).toBeVisible();

    // 3. ログイン・新規登録ボタンが表示されているか確認
    const loginButton = page.getByRole('button', {
      name: 'ログイン・新規登録して始める',
    });
    await expect(loginButton).toBeVisible();
  });
});
