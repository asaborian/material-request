import { eq } from 'drizzle-orm';
import { db } from './index';
import { users } from './schema';

/**
 * 1. ClerkユーザーIDから自前DB(users)のレコードを検索・確認する関数
 */
export async function getDbUserByClerkId(clerkUserId: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);

  return result[0] ?? null;
}

/**
 * 2. 自前DB(users)に新規ユーザーを1行 INSERT する関数
 */
export type CreateUserInput = {
  clerkUserId: string;
  name: string;
  department: string;
  role: 'applicant' | 'admin';
};

export async function createDbUser(userData: CreateUserInput) {
  const [newUser] = await db
    .insert(users)
    .values({
      clerkUserId: userData.clerkUserId,
      name: userData.name,
      department: userData.department,
      role: userData.role,
    })
    .returning();

  return newUser;
}
