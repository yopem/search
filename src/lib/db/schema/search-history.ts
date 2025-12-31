import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { createInsertSchema, createUpdateSchema } from "drizzle-zod"

import { createCustomId } from "@/lib/utils/custom-id"

export const searchHistoryTable = pgTable("search_history", {
  id: text()
    .primaryKey()
    .$defaultFn(() => createCustomId()),
  userId: text("user_id").notNull(),
  query: text("query").notNull(),
  category: text("category").notNull(),
  resultCount: integer("result_count").notNull().default(0),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
})

export const insertSearchHistorySchema = createInsertSchema(searchHistoryTable)
export const updateSearchHistorySchema = createUpdateSchema(searchHistoryTable)

export type SelectSearchHistory = typeof searchHistoryTable.$inferSelect
export type InsertSearchHistory = typeof searchHistoryTable.$inferInsert
