"use client"

import { Button } from "@/components/ui/button"

interface UserMenuTriggerProps {
  user: {
    id: string
    email: string
    name?: string
  }
}

const getInitial = (user: UserMenuTriggerProps["user"]) => {
  if (user.name) {
    return user.name.charAt(0).toUpperCase()
  }
  return user.email.charAt(0).toUpperCase()
}

const getColorFromEmail = (email: string) => {
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

const UserMenuTrigger = ({ user }: UserMenuTriggerProps) => {
  const initial = getInitial(user)
  const bgColor = getColorFromEmail(user.email)

  return (
    <Button variant="ghost" className="size-8 rounded-full p-0">
      <div
        className={`flex size-full items-center justify-center rounded-full text-sm font-medium text-white ${bgColor}`}
      >
        {initial}
      </div>
    </Button>
  )
}

export default UserMenuTrigger
