import { boolean, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkUserId: text('clerk_user_id').notNull().unique(),
  name: text('name').notNull(),
  department: text('department').notNull(),
  role: text('role').notNull(), // 'applicant' | 'admin'（アプリ側で明示指定）
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const requests = pgTable('requests', {
  // ----------------------------------------------------
  // 1. システム管理項目（下書きであっても絶対に必須）
  // ----------------------------------------------------
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  status: text('status').notNull(), // 'draft' | 'submitted' | 'checking_price' | 'price_confirmed' | 'approved' | 'rejected'

  // ----------------------------------------------------
  // 2. ユーザー入力項目（下書き途中の未入力を許容するため nullable）
  //    ※「提出（submitted）」時の必須チェックはアプリ側の Zod で鉄壁ガードする
  // ----------------------------------------------------
  annualQuantity: integer('annual_quantity'),
  reason: text('reason'),

  // 新規品情報
  newItemName: text('new_item_name'),
  newItemSpecification: text('new_item_specification'),
  newItemPackageUnit: text('new_item_package_unit'),
  newItemUnit: text('new_item_unit'),
  newItemPackagePrice: integer('new_item_package_price'),
  newItemQuantityPerPackage: integer('new_item_quantity_per_package'),
  newItemUnitPrice: integer('new_item_unit_price'),

  // 免除条件①（既存品あり）
  hasExistingItem: boolean('has_existing_item'),
  existingItemName: text('existing_item_name'),
  existingItemSpecification: text('existing_item_specification'),
  existingItemPackageUnit: text('existing_item_package_unit'),
  existingItemUnit: text('existing_item_unit'),
  existingItemPackagePrice: integer('existing_item_package_price'),
  existingItemQuantityPerPackage: integer('existing_item_quantity_per_package'),
  existingItemUnitPrice: integer('existing_item_unit_price'),

  // 免除条件②（価格判定）
  // ※ 同額以下（<=）も許容するため isCheaperOrEqual に命名変更
  // ※ 不要な priceDifference（包装価格差）は削除し、単価差のみ保持
  isCheaperOrEqual: boolean('is_cheaper_or_equal'),
  unitPriceDifference: integer('unit_price_difference'),

  // 免除条件③（中止品指定）
  hasDiscontinuedItem: boolean('has_discontinued_item'),
  discontinuedItemName: text('discontinued_item_name'),
  discontinuedItemSpecification: text('discontinued_item_specification'),

  // 総合判定（未判定・価格未確定時は null）
  isExemptFromPresentation: boolean('is_exempt_from_presentation'),

  // ----------------------------------------------------
  // 3. タイムスタンプ（システム自動付与）
  // ----------------------------------------------------
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
