import { createInsertSchema } from 'drizzle-orm/zod';
import { users } from '@/db/schema';
import { z } from 'zod';

// 1. users テーブル全体の Zod スキーマ
export const insertUserSchema = createInsertSchema(users, {
  name: (schema) =>
    schema.min(1, '名前は必須です').max(50, '50文字以内で入力してください'),
  department: (schema) =>
    schema
      .min(1, '所属部署は必須です')
      .max(100, '100文字以内で入力してください'),
});

// 2. setup 画面のフォーム専用スキーマ（name と department だけを抽出）
export const setupFormSchema = insertUserSchema.pick({
  name: true,
  department: true,
});

// 3. TypeScript の型定義
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SetupFormInput = z.infer<typeof setupFormSchema>;
