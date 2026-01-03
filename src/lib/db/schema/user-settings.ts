import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { createInsertSchema, createUpdateSchema } from "drizzle-zod"

import { createCustomId } from "@/lib/utils/custom-id"

export const userSettingsTable = pgTable("user_settings", {
  id: text()
    .primaryKey()
    .$defaultFn(() => createCustomId()),
  userId: text("user_id").notNull().unique(),
  showSearchHistory: boolean("show_search_history").notNull().default(true),
  openInNewTab: boolean("open_in_new_tab").notNull().default(true),
  showInfoboxPanels: boolean("show_infobox_panels").notNull().default(true),
  showCalculator: boolean("show_calculator").notNull().default(true),
  showUnitConverter: boolean("show_unit_converter").notNull().default(true),
  showWeather: boolean("show_weather").notNull().default(true),
  defaultLanguage: text("default_language"),
  defaultTimeRange: text("default_time_range"),
  defaultSafeSearch: text("default_safe_search"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const insertUserSettingsSchema = createInsertSchema(userSettingsTable)
export const updateUserSettingsSchema = createUpdateSchema(userSettingsTable)

export type SelectUserSettings = typeof userSettingsTable.$inferSelect
export type InsertUserSettings = typeof userSettingsTable.$inferInsert
