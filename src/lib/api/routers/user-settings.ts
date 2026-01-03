import { ORPCError } from "@orpc/server"
import { eq } from "drizzle-orm"

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
}
