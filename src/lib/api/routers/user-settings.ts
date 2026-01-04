import { ORPCError } from "@orpc/server"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { protectedProcedure } from "@/lib/api/orpc"
import { updateUserSettingsSchema, userSettingsTable } from "@/lib/db/schema"

export const userSettingsRouter = {
  get: protectedProcedure.handler(async ({ context }) => {
    try {
      const existing = await context.db
        .select()
        .from(userSettingsTable)
        .where(eq(userSettingsTable.userId, context.session.id))
        .limit(1)

      if (existing.length > 0) {
        return existing[0]
      }

      const [newSettings] = await context.db
        .insert(userSettingsTable)
        .values({
          userId: context.session.id,
          showSearchHistory: true,
          openInNewTab: true,
          showInfoboxPanels: true,
          showCalculator: true,
          showUnitConverter: true,
          showWeather: true,
          showImagesCategory: true,
          showNewsCategory: true,
          showVideosCategory: true,
          showMusicCategory: true,
          showMapCategory: false,
          showScienceCategory: false,
          showFilesCategory: false,
          showSocialMediaCategory: false,
          showTechCategory: false,
        })
        .returning()

      return newSettings
    } catch (error) {
      if (error instanceof ORPCError) {
        throw error
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to fetch user settings",
      })
    }
  }),

  update: protectedProcedure
    .input(
      updateUserSettingsSchema.pick({
        showSearchHistory: true,
        openInNewTab: true,
        showInfoboxPanels: true,
        showCalculator: true,
        showUnitConverter: true,
        showWeather: true,
        showImagesCategory: true,
        showNewsCategory: true,
        showVideosCategory: true,
        showMusicCategory: true,
        showMapCategory: true,
        showScienceCategory: true,
        showFilesCategory: true,
        showSocialMediaCategory: true,
        showTechCategory: true,
        defaultLanguage: true,
        defaultTimeRange: true,
        defaultSafeSearch: true,
      }),
    )
    .handler(async ({ input, context }) => {
      try {
        const result = await context.db
          .update(userSettingsTable)
          .set({
            showSearchHistory: input.showSearchHistory,
            openInNewTab: input.openInNewTab,
            showInfoboxPanels: input.showInfoboxPanels,
            showCalculator: input.showCalculator,
            showUnitConverter: input.showUnitConverter,
            showWeather: input.showWeather,
            showImagesCategory: input.showImagesCategory,
            showNewsCategory: input.showNewsCategory,
            showVideosCategory: input.showVideosCategory,
            showMusicCategory: input.showMusicCategory,
            showMapCategory: input.showMapCategory,
            showScienceCategory: input.showScienceCategory,
            showFilesCategory: input.showFilesCategory,
            showSocialMediaCategory: input.showSocialMediaCategory,
            showTechCategory: input.showTechCategory,
            defaultLanguage: input.defaultLanguage,
            defaultTimeRange: input.defaultTimeRange,
            defaultSafeSearch: input.defaultSafeSearch,
            updatedAt: new Date(),
          })
          .where(eq(userSettingsTable.userId, context.session.id))
          .returning()

        if (result.length === 0) {
          throw new ORPCError("NOT_FOUND", {
            message: "User settings not found",
          })
        }

        return result[0]
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to update user settings",
        })
      }
    }),

  disableDefaultBang: protectedProcedure
    .input(z.object({ shortcut: z.string() }))
    .handler(async ({ input, context }) => {
      try {
        const existing = await context.db
          .select()
          .from(userSettingsTable)
          .where(eq(userSettingsTable.userId, context.session.id))
          .limit(1)

        if (existing.length === 0) {
          throw new ORPCError("NOT_FOUND", {
            message: "User settings not found",
          })
        }

        const currentDisabled = existing[0].disabledDefaultBangs
        const normalizedShortcut = input.shortcut.toLowerCase()

        if (currentDisabled.includes(normalizedShortcut)) {
          return existing[0]
        }

        const newDisabled = [...currentDisabled, normalizedShortcut]

        const [updated] = await context.db
          .update(userSettingsTable)
          .set({
            disabledDefaultBangs: newDisabled,
            updatedAt: new Date(),
          })
          .where(eq(userSettingsTable.userId, context.session.id))
          .returning()

        return updated
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to disable default bang",
        })
      }
    }),

  enableDefaultBang: protectedProcedure
    .input(z.object({ shortcut: z.string() }))
    .handler(async ({ input, context }) => {
      try {
        const existing = await context.db
          .select()
          .from(userSettingsTable)
          .where(eq(userSettingsTable.userId, context.session.id))
          .limit(1)

        if (existing.length === 0) {
          throw new ORPCError("NOT_FOUND", {
            message: "User settings not found",
          })
        }

        const currentDisabled = existing[0].disabledDefaultBangs
        const normalizedShortcut = input.shortcut.toLowerCase()

        const newDisabled = currentDisabled.filter(
          (s) => s !== normalizedShortcut,
        )

        const [updated] = await context.db
          .update(userSettingsTable)
          .set({
            disabledDefaultBangs: newDisabled,
            updatedAt: new Date(),
          })
          .where(eq(userSettingsTable.userId, context.session.id))
          .returning()

        return updated
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to enable default bang",
        })
      }
    }),
}
