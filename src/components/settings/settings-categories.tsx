"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"

interface SettingsCategoriesProps {
  showImagesCategory?: boolean
  showNewsCategory?: boolean
  showVideosCategory?: boolean
  showMusicCategory?: boolean
  showMapCategory?: boolean
  showScienceCategory?: boolean
  showFilesCategory?: boolean
  showSocialMediaCategory?: boolean
  showTechCategory?: boolean
  onToggleImagesCategory: (checked: boolean) => void
  onToggleNewsCategory: (checked: boolean) => void
  onToggleVideosCategory: (checked: boolean) => void
  onToggleMusicCategory: (checked: boolean) => void
  onToggleMapCategory: (checked: boolean) => void
  onToggleScienceCategory: (checked: boolean) => void
  onToggleFilesCategory: (checked: boolean) => void
  onToggleSocialMediaCategory: (checked: boolean) => void
  onToggleTechCategory: (checked: boolean) => void
  disabled?: boolean
}

const SettingsCategories = ({
  showImagesCategory,
  showNewsCategory,
  showVideosCategory,
  showMusicCategory,
  showMapCategory,
  showScienceCategory,
  showFilesCategory,
  showSocialMediaCategory,
  showTechCategory,
  onToggleImagesCategory,
  onToggleNewsCategory,
  onToggleVideosCategory,
  onToggleMusicCategory,
  onToggleMapCategory,
  onToggleScienceCategory,
  onToggleFilesCategory,
  onToggleSocialMediaCategory,
  onToggleTechCategory,
  disabled,
}: SettingsCategoriesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-muted-foreground text-sm">
          The All category is always visible and cannot be disabled
        </div>

        <div className="space-y-4">
          <div className="text-sm font-medium">Default Categories</div>
          <div className="text-muted-foreground text-xs">
            Categories shown by default (can be disabled)
          </div>

          <Field className="flex flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <FieldLabel>Show Images category</FieldLabel>
              <FieldDescription>Image search results</FieldDescription>
            </div>
            <Switch
              checked={showImagesCategory ?? true}
              onCheckedChange={onToggleImagesCategory}
              disabled={disabled}
            />
          </Field>

          <Field className="flex flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <FieldLabel>Show News category</FieldLabel>
              <FieldDescription>
                News articles and current events
              </FieldDescription>
            </div>
            <Switch
              checked={showNewsCategory ?? true}
              onCheckedChange={onToggleNewsCategory}
              disabled={disabled}
            />
          </Field>

          <Field className="flex flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <FieldLabel>Show Videos category</FieldLabel>
              <FieldDescription>
                Video content from various platforms
              </FieldDescription>
            </div>
            <Switch
              checked={showVideosCategory ?? true}
              onCheckedChange={onToggleVideosCategory}
              disabled={disabled}
            />
          </Field>

          <Field className="flex flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <FieldLabel>Show Music category</FieldLabel>
              <FieldDescription>Songs, albums, and artists</FieldDescription>
            </div>
            <Switch
              checked={showMusicCategory ?? true}
              onCheckedChange={onToggleMusicCategory}
              disabled={disabled}
            />
          </Field>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-medium">Additional Categories</div>
          <div className="text-muted-foreground text-xs">
            Enable specialized search categories
          </div>

          <Field className="flex flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <FieldLabel>Show Map category</FieldLabel>
              <FieldDescription>
                Search for locations and places
              </FieldDescription>
            </div>
            <Switch
              checked={showMapCategory ?? false}
              onCheckedChange={onToggleMapCategory}
              disabled={disabled}
            />
          </Field>

          <Field className="flex flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <FieldLabel>Show Science category</FieldLabel>
              <FieldDescription>
                Search academic papers and publications
              </FieldDescription>
            </div>
            <Switch
              checked={showScienceCategory ?? false}
              onCheckedChange={onToggleScienceCategory}
              disabled={disabled}
            />
          </Field>

          <Field className="flex flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <FieldLabel>Show Files category</FieldLabel>
              <FieldDescription>
                Search for files, torrents, and downloads
              </FieldDescription>
            </div>
            <Switch
              checked={showFilesCategory ?? false}
              onCheckedChange={onToggleFilesCategory}
              disabled={disabled}
            />
          </Field>

          <Field className="flex flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <FieldLabel>Show Social Media category</FieldLabel>
              <FieldDescription>
                Search posts from Reddit, Mastodon, and Lemmy
              </FieldDescription>
            </div>
            <Switch
              checked={showSocialMediaCategory ?? false}
              onCheckedChange={onToggleSocialMediaCategory}
              disabled={disabled}
            />
          </Field>

          <Field className="flex flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <FieldLabel>Show Tech category</FieldLabel>
              <FieldDescription>
                Search developer resources and IT content
              </FieldDescription>
            </div>
            <Switch
              checked={showTechCategory ?? false}
              onCheckedChange={onToggleTechCategory}
              disabled={disabled}
            />
          </Field>
        </div>
      </CardContent>
    </Card>
  )
}

export default SettingsCategories
