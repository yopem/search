"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogInIcon } from "lucide-react"

import UserMenu from "@/components/auth/user-menu"
import Logo from "@/components/logo"
import { Button } from "@/components/ui/button"

interface SiteHeaderProps {
  session: {
    id: string
    email: string
    name: string | null
  } | null
}

const SiteHeader = ({ session }: SiteHeaderProps) => {
  const pathname = usePathname()

  if (pathname.startsWith("/search")) {
    return null
  }

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
              <LogInIcon className="size-4" />
              <span className="sr-only">Login</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

export default SiteHeader
