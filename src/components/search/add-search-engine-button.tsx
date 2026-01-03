"use client"

import { useEffect, useState } from "react"
import { PlusIcon, SearchIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getBrowserInfo } from "@/lib/utils/browser-detection"
import {
  installSearchEngine,
  type InstallationResult,
} from "@/lib/utils/search-engine-installer"

const DISMISSED_KEY = "search-engine-prompt-dismissed"

const AddSearchEngineButton = () => {
  const [isDismissed, setIsDismissed] = useState(true)
  const [isInstalling, setIsInstalling] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [result, setResult] = useState<InstallationResult | null>(null)
  const [browserInfo, setBrowserInfo] = useState<{
    name: string
    canInstall: boolean
  }>({ name: "unknown", canInstall: false })

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY)
    const info = getBrowserInfo()
    setBrowserInfo({
      name: info.name,
      canInstall: info.canInstallSearchEngine,
    })
    setIsDismissed(dismissed === "true")
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true")
    setIsDismissed(true)
  }

  const handleInstall = async () => {
    setIsInstalling(true)
    setResult(null)

    const info = getBrowserInfo()
    const installResult = await installSearchEngine(info)

    setResult(installResult)
    setIsInstalling(false)

    if (!installResult.success && installResult.instructions) {
      setShowInstructions(true)
    } else if (installResult.success) {
      setTimeout(() => {
        handleDismiss()
      }, 3000)
    }
  }

  if (isDismissed || !browserInfo.canInstall) {
    return null
  }

  return (
    <div className="bg-card relative w-full rounded-lg border p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SearchIcon className="text-muted-foreground size-5" />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">
              Make Yopem your default search engine
            </p>
            <p className="text-muted-foreground text-xs">
              Search privately from your browser's address bar
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
            <Button
              variant="default"
              size="sm"
              onClick={handleInstall}
              disabled={isInstalling}
              render={<DialogTrigger />}
            >
              <PlusIcon />
              {isInstalling ? "Adding..." : "Add"}
            </Button>
            <DialogPopup>
              <DialogHeader>
                <DialogTitle>
                  {result?.success ? "Success!" : "Installation Instructions"}
                </DialogTitle>
                <DialogDescription>
                  {result?.success
                    ? "Search engine added successfully!"
                    : "Follow these steps to add Yopem as your default search engine"}
                </DialogDescription>
              </DialogHeader>
              <DialogPanel>
                {result && !result.success && result.instructions && (
                  <div className="space-y-4">
                    <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        💡 Important First Step
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        You must perform at least one search on Yopem before it
                        appears in your browser's search engine list.
                      </p>
                    </div>
                    <div className="text-sm whitespace-pre-line">
                      {result.instructions}
                    </div>
                  </div>
                )}
                {result?.success && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {result.message}
                  </p>
                )}
              </DialogPanel>
              <DialogFooter variant="bare">
                <Button variant="outline" render={<DialogClose />}>
                  Close
                </Button>
              </DialogFooter>
            </DialogPopup>
          </Dialog>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDismiss}
            aria-label="Dismiss"
          >
            <XIcon />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AddSearchEngineButton
