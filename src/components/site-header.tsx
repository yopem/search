import Link from "next/link"
import { LogIn } from "lucide-react"

import { UserMenu } from "@/components/auth/user-menu"
import Logo from "@/components/logo"
import ThemeSwitcher from "@/components/theme/theme-switcher"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth/session"

export async function SiteHeader() {
  const session = await auth()

  return (
    <header className="bg-background/80 fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-sm">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-6 w-6" />
          <span className="font-semibold">Yopem</span>
        </Link>
        <div className="flex items-center gap-2">
          {session && (
            <UserMenu
              user={{
                id: session.id,
                email: session.email,
                name: session.name ?? undefined,
              }}
            />
          )}
          {!session && (
            <Button
              variant="ghost"
              size="icon"
              render={<Link href="/auth/login" />}
            >
              <LogIn className="size-4" />
              <span className="sr-only">Sign in</span>
            </Button>
          )}
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}
