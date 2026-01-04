import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core"
import { createInsertSchema, createUpdateSchema } from "drizzle-zod"

import { createCustomId } from "@/lib/utils/custom-id"

export const customBangsTable = pgTable(
  "custom_bangs",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createCustomId()),
    userId: text("user_id").notNull(),
    shortcut: text("shortcut").notNull(),
    url: text("url").notNull(),
    label: text("label").notNull(),
    isEnabled: boolean("is_enabled").notNull().default(true),
    isSystemOverride: boolean("is_system_override").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdShortcutUnique: unique("custom_bangs_user_id_shortcut_unique").on(
      table.userId,
      table.shortcut,
    ),
    userIdIdx: index("custom_bangs_user_id_idx").on(table.userId),
    userIdEnabledIdx: index("custom_bangs_user_id_enabled_idx").on(
      table.userId,
      table.isEnabled,
    ),
  }),
)

export const insertCustomBangSchema = createInsertSchema(customBangsTable)
export const updateCustomBangSchema = createUpdateSchema(customBangsTable)

export type SelectCustomBang = typeof customBangsTable.$inferSelect
export type InsertCustomBang = typeof customBangsTable.$inferInsert
