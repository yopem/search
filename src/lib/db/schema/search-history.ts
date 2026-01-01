import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { createInsertSchema, createUpdateSchema } from "drizzle-zod"

import { createCustomId } from "@/lib/utils/custom-id"

export const searchHistoryTable = pgTable(
  "search_history",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createCustomId()),
    userId: text("user_id").notNull(),
    query: text("query").notNull(),
    category: text("category").notNull(),
    resultCount: integer("result_count").notNull().default(0),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("search_history_user_id_idx").on(table.userId),
    userIdTimestampIdx: index("search_history_user_id_timestamp_idx").on(
      table.userId,
      table.timestamp,
    ),
    queryIdx: index("search_history_query_idx").on(table.query),
  }),
)

export const insertSearchHistorySchema = createInsertSchema(searchHistoryTable)
export const updateSearchHistorySchema = createUpdateSchema(searchHistoryTable)

export type SelectSearchHistory = typeof searchHistoryTable.$inferSelect
export type InsertSearchHistory = typeof searchHistoryTable.$inferInsert
