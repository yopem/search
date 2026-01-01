"use client"

import Link from "next/link"
import { LogOut, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu"
import { logout } from "@/lib/auth/logout"

interface UserMenuProps {
  user: {
    id: string
    email: string
    name?: string
  }
}

function getInitial(user: UserMenuProps["user"]) {
  if (user.name) {
    return user.name.charAt(0).toUpperCase()
  }
  return user.email.charAt(0).toUpperCase()
}

function getColorFromEmail(email: string) {
  let hash = 0
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash)
  }

  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-orange-500",
    "bg-teal-500",
  ]

  return colors[Math.abs(hash) % colors.length]
}

const UserMenu = (props: UserMenuProps) => {
  const { user } = props
  const initial = getInitial(user)
  const bgColor = getColorFromEmail(user.email)

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            variant="ghost"
            className="relative size-8 rounded-full p-0 sm:size-8"
          />
        }
      >
        <div
          className={`flex size-8 items-center justify-center rounded-full text-sm font-medium text-white ${bgColor}`}
        >
          {initial}
        </div>
      </MenuTrigger>
      <MenuPopup align="end" className="w-56">
        <div className="flex flex-col gap-1 px-2 py-1.5">
          <p className="text-sm font-medium">{user.name ?? user.email}</p>
          <p className="text-muted-foreground text-xs">{user.email}</p>
        </div>
        <MenuSeparator />
        <MenuItem render={<Link href="/settings" />}>
          <Settings className="mr-2 size-4" />
          Settings
        </MenuItem>
        <MenuSeparator />
        <MenuItem
          render={
            <form action={logout} className="w-full">
              <button type="submit" className="flex w-full items-center" />
            </form>
          }
        >
          <LogOut className="mr-2 size-4" />
          Sign out
        </MenuItem>
      </MenuPopup>
    </Menu>
  )
}

export default UserMenu
