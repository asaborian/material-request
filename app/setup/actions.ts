'use server';

import { auth } from '@clerk/nextjs/server';
import { createDbUser, getDbUserByClerkId } from '@/db/users';
import { revalidatePath } from 'next/cache';
import { setupFormSchema } from '@/lib/validations/user';
import type { SetupFormInput } from '@/lib/validations/user';

export async function createUserAction(formData: SetupFormInput) {
  const parsed = setupFormSchema.safeParse(formData);

  // ① バリデーション失敗時の throw を return に変更
  if (!parsed.success) {
    return {
      success: false,
      error: '入力内容に誤りがあります。',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // 1. Clerkから現在ログイン中のユーザーIDを取得
  const { userId: clerkUserId } = await auth();

  // ② 未認証時の throw を return に変更
  if (!clerkUserId) {
    return {
      success: false,
      error: '認証されていません。ログインし直してください。',
    };
  }

  // 2. 既に自前DB(users)に登録済みかチェック（二重登録の防止）
  const existingUser = await getDbUserByClerkId(clerkUserId);

  // ③ 二重登録時の throw を return に変更
  if (existingUser) {
    return {
      success: false,
      error: '既に初期セットアップが完了しています。',
    };
  }

  // 3. DB登録処理を実行
  // ※ このServer Actionは申請者（applicant）の初期セットアップ用のため、roleは'applicant'とする。
  // ※ adminユーザーの作成（権限付与）は、Neonダッシュボードでの直接role変更、
  //   または将来的な管理者専用UIでの設定機能を想定。
  const newUser = await createDbUser({
    clerkUserId,
    name: parsed.data.name,
    department: parsed.data.department,
    role: 'applicant',
  });

  // トップページ（/）のキャッシュを破棄し、次回アクセス時に必ず最新のDB状態で交通整理させる
  revalidatePath('/');

  // ④ 最後の return を { success: true, data: newUser } に変更
  return {
    success: true,
    data: newUser,
  };
}
