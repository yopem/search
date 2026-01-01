"use client"

import { useEffect, useState } from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { MenuItem } from "@/components/ui/menu"

const ThemeSwitcherMenu = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <MenuItem
      onClick={() => {
        if (mounted) {
          setTheme(theme === "dark" ? "light" : "dark")
        }
      }}
    >
      {mounted && theme === "dark" ? (
        <SunIcon className="mr-2 size-4" />
      ) : (
        <MoonIcon className="mr-2 size-4" />
      )}
      {mounted && theme === "dark" ? "Light Mode" : "Dark Mode"}
    </MenuItem>
  )
}

export default ThemeSwitcherMenu
