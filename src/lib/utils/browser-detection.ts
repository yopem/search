export interface BrowserInfo {
  name: "chrome" | "firefox" | "safari" | "edge" | "unknown"
  version: string
  isMobile: boolean
  canInstallSearchEngine: boolean
}

export function isMobile(): boolean {
  if (typeof window === "undefined") return false

  const userAgent = navigator.userAgent.toLowerCase()
  const mobileKeywords = [
    "android",
    "webos",
    "iphone",
    "ipad",
    "ipod",
    "blackberry",
    "windows phone",
  ]

  return mobileKeywords.some((keyword) => userAgent.includes(keyword))
}

export function getBrowserInfo(): BrowserInfo {
  if (typeof window === "undefined") {
    return {
      name: "unknown",
      version: "",
      isMobile: false,
      canInstallSearchEngine: false,
    }
  }

  const userAgent = navigator.userAgent.toLowerCase()
  const mobile = isMobile()

  let name: BrowserInfo["name"] = "unknown"
  let version = ""

  if (userAgent.includes("edg/")) {
    name = "edge"
    const match = userAgent.match(/edg\/(\d+)/)
    version = match?.[1] || ""
  } else if (userAgent.includes("chrome/") && !userAgent.includes("edg/")) {
    name = "chrome"
    const match = userAgent.match(/chrome\/(\d+)/)
    version = match?.[1] || ""
  } else if (userAgent.includes("firefox/")) {
    name = "firefox"
    const match = userAgent.match(/firefox\/(\d+)/)
    version = match?.[1] || ""
  } else if (
    userAgent.includes("safari/") &&
    !userAgent.includes("chrome/") &&
    !userAgent.includes("chromium/")
  ) {
    name = "safari"
    const match = userAgent.match(/version\/(\d+)/)
    version = match?.[1] || ""
  }

  const canInstallSearchEngine =
    name === "chrome" ||
    name === "edge" ||
    name === "firefox" ||
    name === "safari"

  return {
    name,
    version,
    isMobile: mobile,
    canInstallSearchEngine,
  }
}

export function canInstallSearchEngine(): boolean {
  const browserInfo = getBrowserInfo()
  return browserInfo.canInstallSearchEngine
}
