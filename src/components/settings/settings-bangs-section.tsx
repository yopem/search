"use client"

import { ExternalLinkIcon } from "lucide-react"

import Link from "@/components/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"

const SettingsBangsSection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Bangs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Field>
          <FieldLabel>Custom search shortcuts</FieldLabel>
          <FieldDescription>
            Use bangs to quickly search specific sites. Type !gh react to search
            GitHub, !w history to search Wikipedia, etc.
          </FieldDescription>
          <Link href="/settings/bangs">
            <Button variant="outline" className="mt-2">
              <ExternalLinkIcon className="mr-2 h-4 w-4" />
              Manage Custom Bangs
            </Button>
          </Link>
        </Field>
      </CardContent>
    </Card>
  )
}

export default SettingsBangsSection
