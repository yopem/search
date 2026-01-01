"use client"

import { ExternalLink } from "lucide-react"

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
              <CardTitle className="text-base group-hover:underline">
                {result.title}
              </CardTitle>
            </a>
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <span>{displayUrl}</span>
            </div>
            {result.content && (
              <CardDescription className="text-sm">
                {result.content}
              </CardDescription>
            )}
          </div>
          <ExternalLink className="text-muted-foreground h-4 w-4" />
        </div>
      </CardHeader>
    </Card>
  )
}

export default WebResultCard
