import { ORPCError } from "@orpc/server"
import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { protectedProcedure } from "@/lib/api/orpc"
import { customBangsTable } from "@/lib/db/schema"
import {
  DEFAULT_BANGS,
  resolveBangs,
  validateBangShortcut,
  validateBangUrl,
} from "@/lib/utils/bangs"

const MAX_CUSTOM_BANGS = 100

const createBangInputSchema = z.object({
  shortcut: z.string().min(1).max(50),
  url: z.string().min(1),
  label: z.string().min(1).max(100),
  isSystemOverride: z.boolean().optional().default(false),
})

const updateBangInputSchema = z.object({
  id: z.string(),
  shortcut: z.string().min(1).max(50).optional(),
  url: z.string().min(1).optional(),
  label: z.string().min(1).max(100).optional(),
  isEnabled: z.boolean().optional(),
})

const importBangSchema = z.object({
  shortcut: z.string(),
  url: z.string(),
  label: z.string(),
  isEnabled: z.boolean().optional().default(true),
})

const importInputSchema = z.object({
  version: z.number(),
  bangs: z.array(importBangSchema),
  mode: z.enum(["skip", "replace"]).optional().default("skip"),
})

export const bangsRouter = {
  list: protectedProcedure.handler(async ({ context }) => {
    try {
      const bangs = await context.db
        .select()
        .from(customBangsTable)
        .where(eq(customBangsTable.userId, context.session.id))
        .orderBy(customBangsTable.createdAt)

      return bangs
    } catch (error) {
      if (error instanceof ORPCError) {
        throw error
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to fetch custom bangs",
      })
    }
  }),

  getResolved: protectedProcedure.handler(async ({ context }) => {
    try {
      const customBangs = await context.db
        .select()
        .from(customBangsTable)
        .where(eq(customBangsTable.userId, context.session.id))

      const userSettings = await context.db.query.userSettingsTable.findFirst({
        where: (table, { eq }) => eq(table.userId, context.session.id),
      })

      const disabledDefaultBangs = userSettings?.disabledDefaultBangs ?? []

      return resolveBangs(customBangs, disabledDefaultBangs)
    } catch (error) {
      if (error instanceof ORPCError) {
        throw error
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to resolve bangs",
      })
    }
  }),

  create: protectedProcedure
    .input(createBangInputSchema)
    .handler(async ({ input, context }) => {
      try {
        if (!validateBangShortcut(input.shortcut)) {
          throw new ORPCError("BAD_REQUEST", {
            message:
              "Invalid shortcut. Only alphanumeric characters are allowed.",
          })
        }

        if (!validateBangUrl(input.url)) {
          throw new ORPCError("BAD_REQUEST", {
            message: "Invalid URL. Must be a valid URL containing {query}.",
          })
        }

        const existingCount = await context.db
          .select()
          .from(customBangsTable)
          .where(eq(customBangsTable.userId, context.session.id))

        if (existingCount.length >= MAX_CUSTOM_BANGS) {
          throw new ORPCError("BAD_REQUEST", {
            message: `Maximum of ${MAX_CUSTOM_BANGS} custom bangs allowed.`,
          })
        }

        const normalizedShortcut = input.shortcut.toLowerCase().trim()

        const existing = await context.db
          .select()
          .from(customBangsTable)
          .where(
            and(
              eq(customBangsTable.userId, context.session.id),
              eq(customBangsTable.shortcut, normalizedShortcut),
            ),
          )
          .limit(1)

        if (existing.length > 0) {
          throw new ORPCError("CONFLICT", {
            message: "A bang with this shortcut already exists.",
          })
        }

        const [newBang] = await context.db
          .insert(customBangsTable)
          .values({
            userId: context.session.id,
            shortcut: normalizedShortcut,
            url: input.url.trim(),
            label: input.label.trim(),
            isEnabled: true,
            isSystemOverride: input.isSystemOverride,
          })
          .returning()

        return newBang
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create custom bang",
        })
      }
    }),

  update: protectedProcedure
    .input(updateBangInputSchema)
    .handler(async ({ input, context }) => {
      try {
        const existing = await context.db
          .select()
          .from(customBangsTable)
          .where(
            and(
              eq(customBangsTable.id, input.id),
              eq(customBangsTable.userId, context.session.id),
            ),
          )
          .limit(1)

        if (existing.length === 0) {
          throw new ORPCError("NOT_FOUND", {
            message: "Bang not found",
          })
        }

        if (input.shortcut !== undefined) {
          if (!validateBangShortcut(input.shortcut)) {
            throw new ORPCError("BAD_REQUEST", {
              message:
                "Invalid shortcut. Only alphanumeric characters are allowed.",
            })
          }

          const normalizedShortcut = input.shortcut.toLowerCase().trim()

          if (normalizedShortcut !== existing[0].shortcut) {
            const duplicate = await context.db
              .select()
              .from(customBangsTable)
              .where(
                and(
                  eq(customBangsTable.userId, context.session.id),
                  eq(customBangsTable.shortcut, normalizedShortcut),
                ),
              )
              .limit(1)

            if (duplicate.length > 0) {
              throw new ORPCError("CONFLICT", {
                message: "A bang with this shortcut already exists.",
              })
            }
          }
        }

        if (input.url !== undefined && !validateBangUrl(input.url)) {
          throw new ORPCError("BAD_REQUEST", {
            message: "Invalid URL. Must be a valid URL containing {query}.",
          })
        }

        const updateData: Partial<typeof customBangsTable.$inferInsert> = {}

        if (input.shortcut !== undefined) {
          updateData.shortcut = input.shortcut.toLowerCase().trim()
        }
        if (input.url !== undefined) {
          updateData.url = input.url.trim()
        }
        if (input.label !== undefined) {
          updateData.label = input.label.trim()
        }
        if (input.isEnabled !== undefined) {
          updateData.isEnabled = input.isEnabled
        }

        const [updatedBang] = await context.db
          .update(customBangsTable)
          .set(updateData)
          .where(
            and(
              eq(customBangsTable.id, input.id),
              eq(customBangsTable.userId, context.session.id),
            ),
          )
          .returning()

        return updatedBang
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to update custom bang",
        })
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      try {
        const result = await context.db
          .delete(customBangsTable)
          .where(
            and(
              eq(customBangsTable.id, input.id),
              eq(customBangsTable.userId, context.session.id),
            ),
          )
          .returning()

        if (result.length === 0) {
          throw new ORPCError("NOT_FOUND", {
            message: "Bang not found",
          })
        }

        return { success: true }
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to delete custom bang",
        })
      }
    }),

  toggle: protectedProcedure
    .input(z.object({ id: z.string(), isEnabled: z.boolean() }))
    .handler(async ({ input, context }) => {
      try {
        const [updatedBang] = await context.db
          .update(customBangsTable)
          .set({ isEnabled: input.isEnabled })
          .where(
            and(
              eq(customBangsTable.id, input.id),
              eq(customBangsTable.userId, context.session.id),
            ),
          )
          .returning()

        return updatedBang
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to toggle bang",
        })
      }
    }),

  export: protectedProcedure.handler(async ({ context }) => {
    try {
      const bangs = await context.db
        .select()
        .from(customBangsTable)
        .where(eq(customBangsTable.userId, context.session.id))

      return {
        version: 1,
        bangs: bangs.map((bang) => ({
          shortcut: bang.shortcut,
          url: bang.url,
          label: bang.label,
          isEnabled: bang.isEnabled,
        })),
      }
    } catch (error) {
      if (error instanceof ORPCError) {
        throw error
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to export bangs",
      })
    }
  }),

  import: protectedProcedure
    .input(importInputSchema)
    .handler(async ({ input, context }) => {
      try {
        if (input.version !== 1) {
          throw new ORPCError("BAD_REQUEST", {
            message: "Unsupported import format version",
          })
        }

        let imported = 0
        let skipped = 0
        const errors: string[] = []

        for (const bang of input.bangs) {
          if (!validateBangShortcut(bang.shortcut)) {
            errors.push(
              `Invalid shortcut "${bang.shortcut}": Only alphanumeric characters allowed`,
            )
            skipped++
            continue
          }

          if (!validateBangUrl(bang.url)) {
            errors.push(
              `Invalid URL for "${bang.shortcut}": Must contain {query} placeholder`,
            )
            skipped++
            continue
          }

          const normalizedShortcut = bang.shortcut.toLowerCase().trim()

          const existing = await context.db
            .select()
            .from(customBangsTable)
            .where(
              and(
                eq(customBangsTable.userId, context.session.id),
                eq(customBangsTable.shortcut, normalizedShortcut),
              ),
            )
            .limit(1)

          if (existing.length > 0) {
            if (input.mode === "skip") {
              skipped++
              continue
            } else {
              await context.db
                .update(customBangsTable)
                .set({
                  url: bang.url.trim(),
                  label: bang.label.trim(),
                  isEnabled: bang.isEnabled,
                })
                .where(
                  and(
                    eq(customBangsTable.userId, context.session.id),
                    eq(customBangsTable.shortcut, normalizedShortcut),
                  ),
                )
              imported++
            }
          } else {
            const currentCount = await context.db
              .select()
              .from(customBangsTable)
              .where(eq(customBangsTable.userId, context.session.id))

            if (currentCount.length >= MAX_CUSTOM_BANGS) {
              errors.push(
                `Maximum of ${MAX_CUSTOM_BANGS} bangs reached. Skipping "${bang.shortcut}"`,
              )
              skipped++
              continue
            }

            await context.db.insert(customBangsTable).values({
              userId: context.session.id,
              shortcut: normalizedShortcut,
              url: bang.url.trim(),
              label: bang.label.trim(),
              isEnabled: bang.isEnabled,
              isSystemOverride: false,
            })
            imported++
          }
        }

        return {
          imported,
          skipped,
          errors,
        }
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to import bangs",
        })
      }
    }),

  reset: protectedProcedure.handler(async ({ context }) => {
    try {
      await context.db
        .delete(customBangsTable)
        .where(eq(customBangsTable.userId, context.session.id))

      return { success: true }
    } catch (error) {
      if (error instanceof ORPCError) {
        throw error
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to reset bangs",
      })
    }
  }),

  getDefaults: protectedProcedure.handler(() => {
    return DEFAULT_BANGS
  }),
}
