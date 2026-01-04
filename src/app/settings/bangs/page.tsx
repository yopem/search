import { redirect } from "next/navigation"

import BangManager from "@/components/settings/bang-manager"
import { auth } from "@/lib/auth/session"

export default async function BangsPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 pt-20">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Manage Bangs</h1>
        <p className="text-muted-foreground mt-2">
          Create and manage custom search shortcuts. Use bangs like !gh to
          quickly search specific sites.
        </p>
      </div>
      <BangManager />
    </div>
  )
}
