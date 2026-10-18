import { test, expect } from '@playwright/test';

test.describe('ウェルカムページの表示確認', () => {
  test('未ログイン状態の要素が正しく表示されていること', async ({ page }) => {
    // 1. ウェルカムページへアクセス
    await page.goto('/welcome');

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
