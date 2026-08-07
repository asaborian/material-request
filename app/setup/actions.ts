'use server';

import { auth } from '@clerk/nextjs/server';
import { createDbUser, getDbUserByClerkId } from '@/db/users';

export type SetupFormInput = {
  name: string;
  department: string;
};

export async function createUserAction(formData: SetupFormInput) {
  // 1. Clerkから現在ログイン中のユーザーIDを取得
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw new Error('認証されていません。ログインし直してください。');
  }

  // 2. 既に自前DB(users)に登録済みかチェック（二重登録の防止）
  const existingUser = await getDbUserByClerkId(clerkUserId);
  if (existingUser) {
    throw new Error('既に初期セットアップが完了しています。');
  }

  // 3. DB登録処理を実行
  // ※ このServer Actionは申請者（applicant）の初期セットアップ用のため、roleは'applicant'とする。
  // ※ adminユーザーの作成（権限付与）は、Neonダッシュボードでの直接role変更、
  //   または将来的な管理者専用UIでの設定機能を想定。
  const newUser = await createDbUser({
    clerkUserId,
    name: formData.name,
    department: formData.department,
    role: 'applicant',
  });

  return newUser;
}
