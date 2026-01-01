import { ORPCError } from "@orpc/server"
import { eq } from "drizzle-orm"

import { protectedProcedure } from "@/lib/api/orpc"
import { updateUserSettingsSchema, userSettingsTable } from "@/lib/db/schema"

export const userSettingsRouter = {
  get: protectedProcedure.handler(async ({ context }) => {
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
      })
      .returning()

    return newSettings
  }),

  update: protectedProcedure
    .input(updateUserSettingsSchema.pick({ showSearchHistory: true }))
    .handler(async ({ input, context }) => {
      const result = await context.db
        .update(userSettingsTable)
        .set({
          showSearchHistory: input.showSearchHistory,
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
    }),
}
