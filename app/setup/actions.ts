'use server';

import { auth } from '@clerk/nextjs/server';
import { createDbUser, getDbUserByClerkId } from '@/db/users';
import { revalidatePath } from 'next/cache';
import { setupFormSchema } from '@/lib/validations/user';
import type { SetupFormInput } from '@/lib/validations/user';

export async function createUserAction(formData: SetupFormInput) {
  const parsed = setupFormSchema.safeParse(formData);

  // ① バリデーション失敗時：各入力欄のエラー（fieldErrors）を返す
  if (!parsed.success) {
    return {
      success: false as const,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // 1. Clerkから現在ログイン中のユーザーIDを取得
  const { userId: clerkUserId } = await auth();

  // ② 未認証時：全体エラー（rootError）を返す
  if (!clerkUserId) {
    return {
      success: false as const,
      rootError: '認証されていません。ログインし直してください。',
    };
  }

  // 2. 既に自前DB(users)に登録済みかチェック（二重登録の防止）
  const existingUser = await getDbUserByClerkId(clerkUserId);

  // ③ 二重登録時：全体エラー（rootError）を返す
  if (existingUser) {
    return {
      success: false as const,
      rootError: '既に初期セットアップが完了しています。',
    };
  }

  // 3. DB登録処理を実行
  const newUser = await createDbUser({
    clerkUserId,
    name: parsed.data.name,
    department: parsed.data.department,
    role: 'applicant',
  });

  // トップページ（/）のキャッシュを破棄し、次回アクセス時に必ず最新のDB状態で交通整理させる
  revalidatePath('/');

  // ④ 成功時
  return {
    success: true as const,
    data: newUser,
  };
}
