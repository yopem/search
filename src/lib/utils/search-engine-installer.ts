import { type BrowserInfo } from "./browser-detection"

export type InstallationResult =
  | { success: true; message: string }
  | { success: false; error: string; instructions?: string }

interface SearchProviderExternal {
  AddSearchProvider?: (url: string) => void
  IsSearchProviderInstalled?: (url: string) => number
}

export async function installSearchEngine(
  browserInfo: BrowserInfo,
): Promise<InstallationResult> {
  const { name, isMobile } = browserInfo

  try {
    if (name === "chrome" || name === "edge") {
      return installChromiumBrowser(isMobile)
    } else if (name === "firefox") {
      return installFirefox()
    } else if (name === "safari") {
      return installSafari(isMobile)
    }

    return {
      success: false,
      error: "Unsupported browser",
      instructions:
        "Your browser does not support automatic search engine installation.",
    }
  } catch (error) {
    return {
      success: false,
      error: "Installation failed",
      instructions:
        "An error occurred during installation. Please try again or add the search engine manually from your browser settings.",
    }
  }
}

function installChromiumBrowser(isMobile: boolean): InstallationResult {
  if (isMobile) {
    return {
      success: false,
      error: "Manual installation required",
      instructions:
        "To add as default search engine:\n\n1. First, perform at least one search on Yopem\n\n2. Tap the three dots menu\n\n3. Go to Settings > Search engine\n\n4. Under 'Site search', find Yopem and tap it\n\n5. Chrome may list it as 'Inactive' - tap to activate it\n\n6. Set it as default if desired\n\nNote: Chrome registers site search engines as 'inactive' by default. You must use the search feature at least once before it appears.",
    }
  }

  return {
    success: false,
    error: "Manual installation required",
    instructions:
      "To add as default search engine:\n\n1. First, perform at least one search on Yopem (type in the search box above and press Enter)\n\n2. Go to chrome://settings/searchEngines\n\n3. Under 'Site search', find Yopem (you may need to scroll)\n\n4. Chrome lists site search engines as 'Inactive' by default - click 'Activate' next to Yopem\n\n5. Once activated, click the three dots next to Yopem and select 'Make default'\n\nNote: You must perform at least one search before Yopem appears in the list.",
  }
}

function installFirefox(): InstallationResult {
  const externalAPI = (
    window as unknown as { external?: SearchProviderExternal }
  ).external

  if (
    externalAPI?.AddSearchProvider &&
    typeof externalAPI.AddSearchProvider === "function"
  ) {
    try {
      externalAPI.AddSearchProvider(window.location.origin + "/opensearch.xml")
      return {
        success: true,
        message: "Search engine added successfully!",
      }
    } catch (error) {
      return {
        success: false,
        error: "Installation failed",
        instructions:
          "Please try adding the search engine manually from Firefox settings.",
      }
    }
  }

  return {
    success: false,
    error: "Manual installation required",
    instructions:
      "To add as default search engine:\n1. Click the address bar\n2. Look for 'Add Yopem' in the dropdown\n3. Or go to Settings > Search and add manually",
  }
}

function installSafari(isMobile: boolean): InstallationResult {
  if (isMobile) {
    return {
      success: false,
      error: "Manual installation required",
      instructions:
        "To add as default search engine:\n1. Open Settings app\n2. Scroll to Safari\n3. Tap Search Engine\n4. Safari does not support custom search engines on iOS",
    }
  }

  return {
    success: false,
    error: "Manual installation required",
    instructions:
      "To add as default search engine:\n1. Open Safari Preferences\n2. Go to Search tab\n3. Click 'Manage Websites...'\n4. Note: Safari may not support custom search engines directly",
  }
}
