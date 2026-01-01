import { ORPCError } from "@orpc/server"
import { desc, eq } from "drizzle-orm"
import z from "zod"

import { protectedProcedure, publicProcedure } from "@/lib/api/orpc"
import {
  insertSearchHistorySchema,
  searchHistoryTable,
  userSettingsTable,
} from "@/lib/db/schema"
import { searxngUrl, weatherApiKey } from "@/lib/env/server"

const searchCategorySchema = z.enum(["general", "images", "videos", "news"])

const searchInputSchema = z.object({
  query: z.string().min(1).max(500),
  category: searchCategorySchema.default("general"),
  page: z.number().min(1).default(1),
  timeRange: z.string().optional(),
  region: z.string().optional(),
  safeSearch: z.string().optional(),
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
  resolution?: string
  img_format?: string
  source?: string
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
      const startTime = Date.now()
      const { query, category, page, timeRange, region, safeSearch } = input

      try {
        const params = new URLSearchParams({
          q: query,
          format: "json",
          categories: category,
          pageno: page.toString(),
        })

        if (timeRange) {
          params.set("time_range", timeRange)
        }

        if (region) {
          params.set("language", region)
        }

        if (safeSearch) {
          params.set("safesearch", safeSearch)
        }

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
          const settings = await context.db
            .select()
            .from(userSettingsTable)
            .where(eq(userSettingsTable.userId, context.session.id))
            .limit(1)

          const shouldSaveHistory =
            settings.length === 0 || settings[0].showSearchHistory

          if (shouldSaveHistory) {
            await context.db.insert(searchHistoryTable).values({
              userId: context.session.id,
              query,
              category,
              resultCount: data.number_of_results,
            })
          }
        }

        const responseTime = Date.now() - startTime

        return {
          query: data.query,
          results: data.results,
          totalResults: data.number_of_results,
          suggestions: data.suggestions ?? [],
          page,
          _meta: {
            responseTime,
          },
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
      try {
        const history = await context.db
          .select()
          .from(searchHistoryTable)
          .where(eq(searchHistoryTable.userId, context.session.id))
          .orderBy(desc(searchHistoryTable.timestamp))
          .limit(50)

        return history
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to fetch search history",
        })
      }
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
        try {
          await context.db.insert(searchHistoryTable).values({
            userId: context.session.id,
            query: input.query,
            category: input.category,
            resultCount: input.resultCount,
          })
        } catch (error) {
          if (error instanceof ORPCError) {
            throw error
          }
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Failed to save search history",
          })
        }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .handler(async ({ input, context }) => {
        try {
          await context.db
            .delete(searchHistoryTable)
            .where(eq(searchHistoryTable.id, input.id))
        } catch (error) {
          if (error instanceof ORPCError) {
            throw error
          }
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Failed to delete search history item",
          })
        }
      }),

    clearAll: protectedProcedure.handler(async ({ context }) => {
      try {
        await context.db
          .delete(searchHistoryTable)
          .where(eq(searchHistoryTable.userId, context.session.id))
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to clear search history",
        })
      }
    }),
  },

  weather: publicProcedure
    .input(z.object({ location: z.string().min(1).max(100) }))
    .handler(async ({ input }) => {
      if (!weatherApiKey) {
        throw new ORPCError("SERVICE_UNAVAILABLE", {
          message: "Weather service not configured",
        })
      }

      try {
        const params = new URLSearchParams({
          key: weatherApiKey,
          q: input.location,
          days: "5",
        })

        const response = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?${params}`,
        )

        if (!response.ok) {
          throw new ORPCError("BAD_REQUEST", {
            message: "Location not found",
          })
        }

        const data = await response.json()

        return {
          location: data.location.name,
          country: data.location.country,
          current: {
            tempC: data.current.temp_c,
            tempF: data.current.temp_f,
            condition: data.current.condition.text,
            humidity: data.current.humidity,
            windKph: data.current.wind_kph,
            feelsLikeC: data.current.feelslike_c,
          },
          forecast: data.forecast.forecastday.map(
            (day: {
              date: string
              day: {
                maxtemp_c: number
                mintemp_c: number
                condition: { text: string }
              }
            }) => ({
              date: day.date,
              maxTempC: day.day.maxtemp_c,
              minTempC: day.day.mintemp_c,
              condition: day.day.condition.text,
            }),
          ),
        }
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to fetch weather data",
        })
      }
    }),
}
