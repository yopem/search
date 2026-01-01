import { publicProcedure } from "@/lib/api/orpc"
import { exampleRouter } from "./routers/example"
import { postRouter } from "./routers/post"
import { searchRouter } from "./routers/search"
import { sessionRouter } from "./routers/session"
import { userSettingsRouter } from "./routers/user-settings"

export const appRouter = {
  health: publicProcedure.handler(() => "ok"),
  example: exampleRouter,
  post: postRouter,
  search: searchRouter,
  session: sessionRouter,
  userSettings: userSettingsRouter,
}

export type AppRouter = typeof appRouter
