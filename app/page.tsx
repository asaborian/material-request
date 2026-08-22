import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getDbUserByClerkId } from '@/db/users';

// キャッシュの使い回しを禁止し、アクセスごとに毎回最新のDB状態・認証状態を評価させる設定
export const dynamic = 'force-dynamic';

export default async function Home() {
  // ClerkからClerk側のユーザーIDを取得（clerkUserIdとして明示）
  const { userId: clerkUserId } = await auth();

  // 1. 未ログインの場合 ➔ /welcome へ転送
  if (!clerkUserId) {
    redirect('/welcome');
  }

  // 自前DB(users)からclerkUserIdをキーに登録済みユーザー情報を取得
  const existingUser = await getDbUserByClerkId(clerkUserId);

  // 初回ログイン等でまだDB(users)にレコードが存在しない場合 ➔ セットアップ画面へ転送
  if (!existingUser) {
    redirect('/setup');
  }

  // 2. ログイン済み ＆ 管理者（admin）の場合 ➔ /admin/requests へ転送
  if (existingUser.role === 'admin') {
    redirect('/admin/requests');
  }

  // 3. ログイン済み ＆ 一般ユーザー（applicant）の場合 ➔ /requests へ転送
  redirect('/requests');
}
