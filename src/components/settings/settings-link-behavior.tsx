"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"

interface SettingsLinkBehaviorProps {
  openInNewTab?: boolean
  onToggle: (checked: boolean) => void
  disabled?: boolean
}

const SettingsLinkBehavior = ({
  openInNewTab = true,
  onToggle,
  disabled = false,
}: SettingsLinkBehaviorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Link Behavior</CardTitle>
      </CardHeader>
      <CardContent>
        <Field className="flex flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <FieldLabel>Open links in new tab</FieldLabel>
            <FieldDescription>
              Search results and external links open in a new browser tab
            </FieldDescription>
          </div>
          <Switch
            checked={openInNewTab}
            onCheckedChange={onToggle}
            disabled={disabled}
          />
        </Field>
      </CardContent>
    </Card>
  )
}

export default SettingsLinkBehavior
