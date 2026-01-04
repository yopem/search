"use client"

import { buildBangUrl, DEFAULT_BANGS, findBang } from "@/lib/utils/bangs"

interface Bang {
  shortcut: string
  url: string
  label: string
  isEnabled: boolean
  isSystemOverride: boolean
}

interface UseBangDetectionProps {
  resolvedBangs?: Bang[]
}

export const useBangDetection = ({ resolvedBangs }: UseBangDetectionProps) => {
  const detectAndHandleBang = (searchQuery: string): boolean => {
    const trimmedQuery = searchQuery.trim()
    const bangRegex = /^!(\w+)\s+(.+)/
    const bangMatch = bangRegex.exec(trimmedQuery)

    if (bangMatch) {
      const [, bangShortcut, query] = bangMatch

      const bangsToUse = resolvedBangs ?? DEFAULT_BANGS
      const bang = findBang(bangsToUse, bangShortcut)

      if (bang) {
        window.location.href = buildBangUrl(bang.url, query)
        return true
      }
    }

    return false
  }

  return {
    detectAndHandleBang,
  }
}
