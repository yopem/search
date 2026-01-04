"use client"

import Link from "next/link"
import { SettingsIcon } from "lucide-react"

import LogoutMenuItem from "@/components/auth/logout-menu-item"
import UserMenuTrigger from "@/components/auth/user-menu-trigger"
import ThemeSwitcherMenu from "@/components/theme/theme-switcher-menu"
import { Menu, MenuItem, MenuPopup, MenuSeparator } from "@/components/ui/menu"

interface UserMenuProps {
  user: {
    id: string
    email: string
    name?: string
  }
}

const UserMenu = (props: UserMenuProps) => {
  const { user } = props

  return (
    <Menu>
      <UserMenuTrigger user={user} />
      <MenuPopup align="end" className="w-56">
        <div className="flex flex-col gap-1 px-2 py-1.5">
          <p className="text-sm font-medium">{user.name ?? user.email}</p>
          <p className="text-muted-foreground text-xs">{user.email}</p>
        </div>
        <MenuSeparator />
        <MenuItem render={<Link href="/settings" />}>
          <SettingsIcon className="mr-2 size-4" />
          Settings
        </MenuItem>
        <ThemeSwitcherMenu />
        <LogoutMenuItem />
      </MenuPopup>
    </Menu>
  )
}

export default UserMenu
