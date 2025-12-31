import { ORPCError } from "@orpc/server"
import { desc, eq } from "drizzle-orm"
import z from "zod"

import { protectedProcedure, publicProcedure } from "@/lib/api/orpc"
import { insertSearchHistorySchema, searchHistoryTable } from "@/lib/db/schema"
import { searxngUrl } from "@/lib/env/server"

const searchCategorySchema = z.enum(["general", "images", "videos", "news"])

const searchInputSchema = z.object({
  query: z.string().min(1).max(500),
  category: searchCategorySchema.default("general"),
  page: z.number().min(1).default(1),
})

const autocompleteInputSchema = z.object({
  query: z.string().min(1).max(100),
})

interface SearxngResult {
  title: string
  url: string
  content?: string
  img_src?: string
  thumbnail?: string
  thumbnail_src?: string
  publishedDate?: string
  author?: string
  iframe_src?: string
  duration?: string
  engine?: string
}

interface SearxngResponse {
  query: string
  number_of_results: number
  results: SearxngResult[]
  suggestions?: string[]
  infoboxes?: unknown[]
  unresponsive_engines?: string[][]
}

export const searchRouter = {
  query: publicProcedure
    .input(searchInputSchema)
    .handler(async ({ input, context }) => {
      const { query, category, page } = input

      try {
        const params = new URLSearchParams({
          q: query,
          format: "json",
          categories: category,
          pageno: page.toString(),
        })

        const response = await fetch(`${searxngUrl}/search?${params}`)

        if (!response.ok) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Search service unavailable",
          })
        }

        const data = (await response.json()) as SearxngResponse

        if (
          context.session &&
          typeof context.session === "object" &&
          "id" in context.session
        ) {
          await context.db.insert(searchHistoryTable).values({
            userId: context.session.id,
            query,
            category,
            resultCount: data.number_of_results,
          })
        }

        return {
          query: data.query,
          results: data.results,
          totalResults: data.number_of_results,
          suggestions: data.suggestions ?? [],
          page,
        }
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to fetch search results",
        })
      }
    }),

  autocomplete: publicProcedure
    .input(autocompleteInputSchema)
    .handler(async ({ input }) => {
      const { query } = input

      try {
        const params = new URLSearchParams({
          q: query,
        })

        const response = await fetch(`${searxngUrl}/autocompleter?${params}`)

        if (!response.ok) {
          return []
        }

        const data = (await response.json()) as [string, string[]]
        return data[1]
      } catch {
        return []
      }
    }),

  history: {
    list: protectedProcedure.handler(async ({ context }) => {
      const history = await context.db
        .select()
        .from(searchHistoryTable)
        .where(eq(searchHistoryTable.userId, context.session.id))
        .orderBy(desc(searchHistoryTable.timestamp))
        .limit(50)

      return history
    }),

    save: protectedProcedure
      .input(
        insertSearchHistorySchema.pick({
          query: true,
          category: true,
          resultCount: true,
        }),
      )
      .handler(async ({ input, context }) => {
        await context.db.insert(searchHistoryTable).values({
          userId: context.session.id,
          query: input.query,
          category: input.category,
          resultCount: input.resultCount,
        })
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .handler(async ({ input, context }) => {
        await context.db
          .delete(searchHistoryTable)
          .where(eq(searchHistoryTable.id, input.id))
      }),

    clearAll: protectedProcedure.handler(async ({ context }) => {
      await context.db
        .delete(searchHistoryTable)
        .where(eq(searchHistoryTable.userId, context.session.id))
    }),
  },
}
