import { ORPCError } from "@orpc/server"
import { desc, eq } from "drizzle-orm"
import z from "zod"

import { protectedProcedure, publicProcedure } from "@/lib/api/orpc"
import {
  insertSearchHistorySchema,
  searchHistoryTable,
  userSettingsTable,
} from "@/lib/db/schema"
import { searxngUrl, tmdbApiKey, weatherApiKey } from "@/lib/env/server"

const searchCategorySchema = z.enum(["general", "images", "videos", "news"])

const infoboxTypeSchema = z.enum([
  "person",
  "place",
  "organization",
  "movie",
  "product",
  "wiki",
  "tech",
])

const infoboxDataSchema = z.object({
  type: infoboxTypeSchema,
  title: z.string(),
  image: z.string().optional(),
  summary: z.string().optional(),
  attributes: z.record(z.string(), z.unknown()).optional(),
  source: z.string(),
  sourceUrl: z.string(),
})

type InfoboxData = z.infer<typeof infoboxDataSchema>

const searchInputSchema = z.object({
  query: z.string().min(1).max(500),
  category: searchCategorySchema.default("general"),
  page: z.number().min(1).default(1),
  timeRange: z.string().optional(),
  region: z.string().optional(),
  safeSearch: z.string().optional(),
  language: z.string().max(10).optional(),
})

const autocompleteInputSchema = z.object({
  query: z.string().min(1).max(100),
  language: z.string().max(10).optional(),
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
  infoboxes?: SearxngInfobox[]
  unresponsive_engines?: string[][]
}

interface SearxngInfobox {
  infobox: string
  content?: string
  engine?: string
  urls?: { title: string; url: string }[]
  img_src?: string
  attributes?: { label: string; value: string | number }[]
}

const detectEntityType = (
  query: string,
  infobox: SearxngInfobox,
): z.infer<typeof infoboxDataSchema>["type"] => {
  const lowerQuery = query.toLowerCase()
  const attributes = infobox.attributes ?? []
  const attributeLabels = attributes.map((attr) => attr.label.toLowerCase())

  if (
    attributeLabels.some(
      (label) =>
        label.includes("born") ||
        label.includes("birth") ||
        label.includes("died") ||
        label.includes("death") ||
        label.includes("occupation"),
    )
  ) {
    return "person"
  }

  if (
    attributeLabels.some(
      (label) =>
        label.includes("population") ||
        label.includes("area") ||
        label.includes("coordinates") ||
        label.includes("country"),
    )
  ) {
    return "place"
  }

  if (
    attributeLabels.some(
      (label) =>
        label.includes("founded") ||
        label.includes("headquarters") ||
        label.includes("industry") ||
        label.includes("ceo"),
    ) ||
    lowerQuery.includes("company") ||
    lowerQuery.includes("corporation")
  ) {
    return "organization"
  }

  if (
    attributeLabels.some(
      (label) =>
        label.includes("director") ||
        label.includes("release") ||
        label.includes("cast") ||
        label.includes("runtime"),
    ) ||
    lowerQuery.includes("movie") ||
    lowerQuery.includes("film")
  ) {
    return "movie"
  }

  if (
    attributeLabels.some(
      (label) =>
        label.includes("price") ||
        label.includes("manufacturer") ||
        label.includes("model"),
    )
  ) {
    return "product"
  }

  if (
    infobox.engine?.toLowerCase().includes("stackoverflow") ||
    infobox.engine?.toLowerCase().includes("mdn") ||
    lowerQuery.includes("api") ||
    lowerQuery.includes("function")
  ) {
    return "tech"
  }

  return "wiki"
}

const parseInfobox = (
  query: string,
  infobox: SearxngInfobox,
): InfoboxData | null => {
  try {
    const entityType = detectEntityType(query, infobox)
    const urls = infobox.urls ?? []
    const sourceUrl = urls[0]?.url ?? ""

    const attributes: Record<string, unknown> = {}
    if (infobox.attributes) {
      for (const attr of infobox.attributes) {
        attributes[attr.label] = attr.value
      }
    }

    const parsedInfobox: InfoboxData = {
      type: entityType,
      title: infobox.infobox,
      image: infobox.img_src,
      summary: infobox.content,
      attributes,
      source: infobox.engine ?? "Wikipedia",
      sourceUrl,
    }

    return infoboxDataSchema.parse(parsedInfobox)
  } catch {
    return null
  }
}

const fetchTmdbMovie = async (query: string): Promise<InfoboxData | null> => {
  if (!tmdbApiKey) {
    return null
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const searchResponse = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(query)}`,
      { signal: controller.signal },
    )

    clearTimeout(timeoutId)

    if (!searchResponse.ok) {
      return null
    }

    const searchData = await searchResponse.json()
    if (!searchData.results || searchData.results.length === 0) {
      return null
    }

    const movie = searchData.results[0]
    const attributes: Record<string, unknown> = {}

    if (movie.release_date) {
      attributes["Release date"] = movie.release_date
    }
    if (movie.vote_average) {
      attributes["Rating"] = `${movie.vote_average}/10`
    }

    const infobox: InfoboxData = {
      type: "movie",
      title: movie.title,
      image: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : undefined,
      summary: movie.overview,
      attributes,
      source: "TMDB",
      sourceUrl: `https://www.themoviedb.org/movie/${movie.id}`,
    }

    return infoboxDataSchema.parse(infobox)
  } catch {
    return null
  }
}

export const searchRouter = {
  query: publicProcedure
    .input(searchInputSchema)
    .handler(async ({ input, context }) => {
      const startTime = Date.now()
      const { query, category, page, timeRange, region, safeSearch, language } =
        input

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

        if (language) {
          params.set("language", language)
        } else if (region) {
          params.set("language", region)
        } else {
          params.set("language", "en")
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

        let infobox: InfoboxData | null = null
        if (
          category === "general" &&
          data.infoboxes &&
          data.infoboxes.length > 0
        ) {
          infobox = parseInfobox(query, data.infoboxes[0])
        }

        if (
          category === "general" &&
          !infobox &&
          (query.toLowerCase().includes("movie") ||
            query.toLowerCase().includes("film"))
        ) {
          infobox = await fetchTmdbMovie(query)
        }

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
          infobox,
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

  getImages: publicProcedure
    .input(
      z.object({
        query: z.string(),
        region: z.string().optional(),
        safeSearch: z.string().optional(),
        language: z.string().max(10).optional(),
      }),
    )
    .handler(async ({ input }) => {
      const { query, region, safeSearch, language } = input

      try {
        const imageParams = new URLSearchParams({
          q: query,
          format: "json",
          categories: "images",
          pageno: "1",
        })

        if (language) {
          imageParams.set("language", language)
        } else if (region) {
          imageParams.set("language", region)
        } else {
          imageParams.set("language", "en")
        }

        if (safeSearch) {
          imageParams.set("safesearch", safeSearch)
        }

        const response = await fetch(`${searxngUrl}/search?${imageParams}`)

        if (!response.ok) {
          return []
        }

        const data = (await response.json()) as SearxngResponse

        if (data.results.length >= 6) {
          return data.results.slice(0, 12)
        }

        return []
      } catch {
        return []
      }
    }),

  autocomplete: publicProcedure
    .input(autocompleteInputSchema)
    .handler(async ({ input }) => {
      const { query, language } = input

      try {
        const params = new URLSearchParams({
          q: query,
        })

        if (language) {
          params.set("language", language)
        }

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
  getLanguages: publicProcedure.handler(async () => {
    try {
      const response = await fetch(`${searxngUrl}/config`)

      if (!response.ok) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to fetch SearXNG config",
        })
      }

      const config = await response.json()

      const locales: Record<string, string> = config.locales ?? {}

      const languageSet = new Set<string>()

      if (config.engines && Array.isArray(config.engines)) {
        config.engines.forEach((engine: { languages?: string[] }) => {
          if (engine.languages && Array.isArray(engine.languages)) {
            engine.languages.forEach((lang: string) => {
              if (lang && lang !== "all" && locales[lang]) {
                languageSet.add(lang)
              }
            })
          }
        })
      }

      const languages = Array.from(languageSet)
        .sort((a, b) => {
          const nameA = locales[a] || a
          const nameB = locales[b] || b
          return nameA.localeCompare(nameB)
        })
        .map((code) => ({
          code,
          name: locales[code] || code,
        }))

      return languages
    } catch (error) {
      if (error instanceof ORPCError) {
        throw error
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to fetch languages from SearXNG",
      })
    }
  }),
}
