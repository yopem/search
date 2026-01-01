import { redirect } from "next/navigation"

import { SettingsContent } from "@/components/settings/settings-content"
import { auth } from "@/lib/auth/session"

export default async function SettingsPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 pt-20">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>
      <SettingsContent />
    </div>
  )
}
