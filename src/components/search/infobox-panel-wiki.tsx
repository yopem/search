"use client"

import { useState } from "react"
import Image from "next/image"
import { ExternalLinkIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface InfoboxPanelWikiProps {
  title: string
  image?: string
  summary?: string
  source: string
  sourceUrl: string
}

const InfoboxPanelWiki = ({
  title,
  image,
  summary,
  source,
  sourceUrl,
}: InfoboxPanelWikiProps) => {
  const [imageError, setImageError] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const truncatedSummary =
    summary && summary.length > 300 && !isExpanded
      ? summary.slice(0, 300) + "..."
      : summary

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {image && !imageError && (
          <div className="bg-muted relative aspect-video w-full overflow-hidden rounded-md">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          </div>
        )}
        {truncatedSummary && (
          <div className="text-muted-foreground space-y-2 text-sm">
            <p>{truncatedSummary}</p>
            {summary && summary.length > 300 && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Show less" : "Read more"}
              </Button>
            )}
          </div>
        )}
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs transition-colors"
        >
          <span>{source}</span>
          <ExternalLinkIcon className="h-3 w-3" />
        </a>
      </CardContent>
    </Card>
  )
}

export default InfoboxPanelWiki
