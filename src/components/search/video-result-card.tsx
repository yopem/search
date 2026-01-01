"use client"

import { ExternalLinkIcon, PlayIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface VideoResult {
  title: string
  url: string
  content?: string
  publishedDate?: string
  duration?: string
  thumbnail?: string
}

const VideoResultCard = ({ result }: { result: VideoResult }) => {
  const displayUrl = new URL(result.url).hostname.replace("www.", "")

  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="flex items-center gap-2">
                <PlayIcon className="text-muted-foreground h-4 w-4" />
                <CardTitle className="text-base group-hover:underline">
                  {result.title}
                </CardTitle>
              </div>
            </a>
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <span>{displayUrl}</span>
              {result.duration && (
                <Badge variant="secondary">{result.duration}</Badge>
              )}
            </div>
            {result.content && (
              <CardDescription className="text-sm">
                {result.content}
              </CardDescription>
            )}
          </div>
          <ExternalLinkIcon className="text-muted-foreground h-4 w-4" />
        </div>
      </CardHeader>
    </Card>
  )
}

export default VideoResultCard
