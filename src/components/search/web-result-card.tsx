"use client"

import { useState } from "react"
import Image from "next/image"
import { ExternalLinkIcon, Globe as GlobeIcon } from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface WebResult {
  title: string
  url: string
  content?: string
  engine?: string
}

const WebResultCard = ({ result }: { result: WebResult }) => {
  const [faviconError, setFaviconError] = useState(false)

  const displayUrl = new URL(result.url).hostname.replace("www.", "")
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${displayUrl}&sz=32`

  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardHeader className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1.5">
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <CardTitle className="text-lg leading-tight font-normal group-hover:underline">
                {result.title}
              </CardTitle>
            </a>
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              {!faviconError ? (
                <Image
                  src={faviconUrl}
                  alt={`${displayUrl} favicon`}
                  width={16}
                  height={16}
                  className="rounded-sm"
                  onError={() => setFaviconError(true)}
                  unoptimized
                />
              ) : (
                <GlobeIcon className="text-muted-foreground h-3.5 w-3.5" />
              )}
              <span className="text-green-700 dark:text-green-500">
                {displayUrl}
              </span>
            </div>
            {result.content && (
              <CardDescription className="line-clamp-3 text-sm leading-relaxed">
                {result.content}
              </CardDescription>
            )}
          </div>
          <ExternalLinkIcon className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
        </div>
      </CardHeader>
    </Card>
  )
}

export default WebResultCard
