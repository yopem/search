"use client"

import { LogOutIcon } from "lucide-react"

import { MenuItem } from "@/components/ui/menu"
import { logout } from "@/lib/auth/logout"

const LogoutMenuItem = () => {
  return (
    <MenuItem
      onClick={async () => {
        await logout()
      }}
    >
      <LogOutIcon className="mr-2 size-4" />
      Log out
    </MenuItem>
  )
}

export default LogoutMenuItem
