import type { SelectCustomBang } from "@/lib/db/schema"

export interface Bang {
  shortcut: string
  url: string
  label: string
  isEnabled: boolean
  isSystemOverride: boolean
}

export const DEFAULT_BANGS: Bang[] = [
  {
    shortcut: "g",
    url: "https://www.google.com/search?q={query}",
    label: "Google",
    isEnabled: true,
    isSystemOverride: false,
  },
  {
    shortcut: "gh",
    url: "https://github.com/search?q={query}",
    label: "GitHub",
    isEnabled: true,
    isSystemOverride: false,
  },
  {
    shortcut: "so",
    url: "https://stackoverflow.com/search?q={query}",
    label: "Stack Overflow",
    isEnabled: true,
    isSystemOverride: false,
  },
  {
    shortcut: "w",
    url: "https://en.wikipedia.org/wiki/Special:Search?search={query}",
    label: "Wikipedia",
    isEnabled: true,
    isSystemOverride: false,
  },
  {
    shortcut: "yt",
    url: "https://www.youtube.com/results?search_query={query}",
    label: "YouTube",
    isEnabled: true,
    isSystemOverride: false,
  },
  {
    shortcut: "a",
    url: "https://www.amazon.com/s?k={query}",
    label: "Amazon",
    isEnabled: true,
    isSystemOverride: false,
  },
  {
    shortcut: "r",
    url: "https://www.reddit.com/search?q={query}",
    label: "Reddit",
    isEnabled: true,
    isSystemOverride: false,
  },
  {
    shortcut: "tw",
    url: "https://twitter.com/search?q={query}",
    label: "Twitter",
    isEnabled: true,
    isSystemOverride: false,
  },
  {
    shortcut: "mdn",
    url: "https://developer.mozilla.org/en-US/search?q={query}",
    label: "MDN Web Docs",
    isEnabled: true,
    isSystemOverride: false,
  },
  {
    shortcut: "npm",
    url: "https://www.npmjs.com/search?q={query}",
    label: "npm",
    isEnabled: true,
    isSystemOverride: false,
  },
  {
    shortcut: "py",
    url: "https://docs.python.org/3/search.html?q={query}",
    label: "Python Docs",
    isEnabled: true,
    isSystemOverride: false,
  },
  {
    shortcut: "wiki",
    url: "https://en.wikipedia.org/wiki/Special:Search?search={query}",
    label: "Wikipedia",
    isEnabled: true,
    isSystemOverride: false,
  },
  {
    shortcut: "imdb",
    url: "https://www.imdb.com/find?q={query}",
    label: "IMDb",
    isEnabled: true,
    isSystemOverride: false,
  },
  {
    shortcut: "maps",
    url: "https://www.google.com/maps/search/{query}",
    label: "Google Maps",
    isEnabled: true,
    isSystemOverride: false,
  },
]

export const validateBangShortcut = (shortcut: string): boolean => {
  if (!shortcut || shortcut.trim().length === 0) {
    return false
  }

  const alphanumericRegex = /^[a-zA-Z0-9]+$/
  return alphanumericRegex.test(shortcut.trim())
}

export const validateBangUrl = (url: string): boolean => {
  if (!url || url.trim().length === 0) {
    return false
  }

  if (!url.includes("{query}")) {
    return false
  }

  try {
    const testUrl = url.replace("{query}", "test")
    new URL(testUrl)
    return true
  } catch {
    return false
  }
}

export const buildBangUrl = (url: string, query: string): string => {
  return url.replace("{query}", encodeURIComponent(query))
}

export const resolveBangs = (
  customBangs: SelectCustomBang[],
  disabledDefaultBangs: string[],
): Bang[] => {
  const customBangsMap = new Map<string, Bang>()
  const enabledCustomBangs = customBangs.filter((bang) => bang.isEnabled)

  for (const bang of enabledCustomBangs) {
    customBangsMap.set(bang.shortcut.toLowerCase(), {
      shortcut: bang.shortcut.toLowerCase(),
      url: bang.url,
      label: bang.label,
      isEnabled: bang.isEnabled,
      isSystemOverride: bang.isSystemOverride,
    })
  }

  const disabledSet = new Set(
    disabledDefaultBangs.map((shortcut) => shortcut.toLowerCase()),
  )

  const defaultBangsFiltered = DEFAULT_BANGS.filter(
    (bang) => !disabledSet.has(bang.shortcut.toLowerCase()),
  )

  for (const defaultBang of defaultBangsFiltered) {
    const shortcut = defaultBang.shortcut.toLowerCase()
    if (!customBangsMap.has(shortcut)) {
      customBangsMap.set(shortcut, {
        ...defaultBang,
        shortcut,
      })
    }
  }

  return Array.from(customBangsMap.values())
}

export const findBang = (bangs: Bang[], shortcut: string): Bang | undefined => {
  return bangs.find((bang) => bang.shortcut === shortcut.toLowerCase())
}
