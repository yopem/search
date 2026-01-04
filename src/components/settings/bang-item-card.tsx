"use client"

import { PencilIcon, TrashIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import type { MergedBang } from "@/hooks/use-merged-bangs"

interface BangItemCardProps {
  bang: MergedBang
  onToggle: (bang: MergedBang) => void
  onEdit: (bang: MergedBang) => void
  onDelete: (bang: MergedBang) => void
}

const BangItemCard = ({
  bang,
  onToggle,
  onEdit,
  onDelete,
}: BangItemCardProps) => {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <code className="bg-muted rounded px-2 py-1 font-mono text-sm">
              !{bang.shortcut}
            </code>
            <span className="font-medium">{bang.label}</span>
            {!bang.isEnabled && <Badge variant="outline">Disabled</Badge>}
            {bang.isSystemOverride && <Badge variant="outline">Custom</Badge>}
            {bang.isDefault && !bang.isSystemOverride && (
              <Badge variant="outline">Default</Badge>
            )}
          </div>
          <p className="text-muted-foreground truncate text-sm">{bang.url}</p>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={bang.isEnabled}
            onCheckedChange={() => onToggle(bang)}
          />
          <Button variant="outline" size="icon" onClick={() => onEdit(bang)}>
            <PencilIcon className="h-4 w-4" />
          </Button>
          {!bang.isDefault && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(bang)}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default BangItemCard
