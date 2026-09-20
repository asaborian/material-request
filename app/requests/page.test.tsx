import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import RequestsPage from './page';

describe('RequestsPage（申請者用ページ）', () => {
  it('「申請一覧（申請者用）」という見出しが表示されること', () => {
    // 1. 作成済みの画面（RequestsPage）をテスト環境内に描画する
    render(<RequestsPage />);

    // 2. 画面内に「申請一覧（申請者用）」の見出し（h1）が存在するか探す
    const heading = screen.getByRole('heading', { name: '申請一覧（申請者用）' });

    // 3. 見出しが正常に存在する（undefinedではない）ことを検証する
    expect(heading).toBeDefined();
  });
});
