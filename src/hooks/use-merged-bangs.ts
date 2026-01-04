"use client"

import { useMemo } from "react"

import { DEFAULT_BANGS } from "@/lib/utils/bangs"

export interface MergedBang {
  id?: string
  shortcut: string
  url: string
  label: string
  isEnabled: boolean
  isSystemOverride: boolean
  isDefault: boolean
}

interface CustomBang {
  id: string
  shortcut: string
  url: string
  label: string
  isEnabled: boolean
  isSystemOverride: boolean
}

export const useMergedBangs = (
  customBangs: CustomBang[],
  disabledDefaultBangs: string[],
) => {
  return useMemo(() => {
    const bangsMap = new Map<string, MergedBang>()

    customBangs.forEach((bang) => {
      bangsMap.set(bang.shortcut.toLowerCase(), {
        id: bang.id,
        shortcut: bang.shortcut,
        url: bang.url,
        label: bang.label,
        isEnabled: bang.isEnabled,
        isSystemOverride: bang.isSystemOverride,
        isDefault: false,
      })
    })

    DEFAULT_BANGS.forEach((bang) => {
      const shortcut = bang.shortcut.toLowerCase()
      if (!bangsMap.has(shortcut)) {
        bangsMap.set(shortcut, {
          shortcut: bang.shortcut,
          url: bang.url,
          label: bang.label,
          isEnabled: !disabledDefaultBangs.includes(bang.shortcut),
          isSystemOverride: false,
          isDefault: true,
        })
      }
    })

    return Array.from(bangsMap.values()).sort((a, b) => {
      if (a.isDefault !== b.isDefault) {
        return a.isDefault ? 1 : -1
      }
      return a.shortcut.localeCompare(b.shortcut)
    })
  }, [customBangs, disabledDefaultBangs])
}
