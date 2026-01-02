"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import InfoboxPanelMovie from "./infobox-panel-movie"
import InfoboxPanelOrganization from "./infobox-panel-organization"
import InfoboxPanelPerson from "./infobox-panel-person"
import InfoboxPanelPlace from "./infobox-panel-place"
import InfoboxPanelProduct from "./infobox-panel-product"
import InfoboxPanelWiki from "./infobox-panel-wiki"

interface InfoboxPanelProps {
  type:
    | "person"
    | "place"
    | "organization"
    | "movie"
    | "product"
    | "wiki"
    | "tech"
  title: string
  image?: string
  summary?: string
  attributes?: Record<string, unknown>
  source: string
  sourceUrl: string
}

const InfoboxPanel = (props: InfoboxPanelProps) => {
  switch (props.type) {
    case "person":
      return <InfoboxPanelPerson {...props} />
    case "place":
      return <InfoboxPanelPlace {...props} />
    case "organization":
      return <InfoboxPanelOrganization {...props} />
    case "movie":
      return <InfoboxPanelMovie {...props} />
    case "product":
      return <InfoboxPanelProduct {...props} />
    case "wiki":
      return <InfoboxPanelWiki {...props} />
    default:
      return <InfoboxPanelWiki {...props} />
  }
}

export const InfoboxPanelSkeleton = () => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  )
}

export default InfoboxPanel
