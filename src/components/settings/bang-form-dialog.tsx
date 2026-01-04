"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toastManager } from "@/components/ui/toast"
import type { MergedBang } from "@/hooks/use-merged-bangs"
import { DEFAULT_BANGS } from "@/lib/utils/bangs"

interface BangFormData {
  shortcut: string
  url: string
  label: string
}

interface BangFormDialogProps {
  isOpen: boolean
  onClose: () => void
  mode: "create" | "edit"
  bang?: MergedBang | null
  customBangs: { shortcut: string }[]
  onCreate: (data: BangFormData & { isSystemOverride: boolean }) => void
  onUpdate: (data: {
    id: string
    shortcut: string
    url: string
    label: string
    isEnabled: boolean
  }) => void
  onCreateOverride: (data: BangFormData & { isSystemOverride: boolean }) => void
  isPending: boolean
}

const BangFormDialog = ({
  isOpen,
  onClose,
  mode,
  bang,
  customBangs,
  onCreate,
  onUpdate,
  onCreateOverride,
  isPending,
}: BangFormDialogProps) => {
  const [formData, setFormData] = useState<BangFormData>({
    shortcut: "",
    url: "",
    label: "",
  })

  useEffect(() => {
    if (isOpen && bang && mode === "edit") {
      setFormData({
        shortcut: bang.shortcut,
        url: bang.url,
        label: bang.label,
      })
    } else if (isOpen && mode === "create") {
      setFormData({ shortcut: "", url: "", label: "" })
    }
  }, [isOpen, bang, mode])

  const handleSubmit = () => {
    if (mode === "create") {
      const normalizedShortcut = formData.shortcut.toLowerCase().trim()
      const defaultBangExists = DEFAULT_BANGS.some(
        (b) => b.shortcut.toLowerCase() === normalizedShortcut,
      )

      if (defaultBangExists) {
        onClose()
        setTimeout(() => {
          toastManager.add({
            title: "Default bang exists",
            description: `A default bang with shortcut "${normalizedShortcut}" already exists. Edit the default bang to create an override instead.`,
          })
        }, 100)
        return
      }

      const customBangExists = customBangs.some(
        (b) => b.shortcut.toLowerCase() === normalizedShortcut,
      )

      if (customBangExists) {
        onClose()
        setTimeout(() => {
          toastManager.add({
            title: "Bang already exists",
            description: `A custom bang with shortcut "${normalizedShortcut}" already exists.`,
          })
        }, 100)
        return
      }

      onCreate({
        shortcut: formData.shortcut.trim(),
        url: formData.url.trim(),
        label: formData.label.trim(),
        isSystemOverride: false,
      })
    } else if (bang) {
      if (bang.isDefault && !bang.id) {
        onCreateOverride({
          shortcut: formData.shortcut.trim(),
          url: formData.url.trim(),
          label: formData.label.trim(),
          isSystemOverride: true,
        })
      } else if (bang.id) {
        onUpdate({
          id: bang.id,
          shortcut: formData.shortcut.trim(),
          url: formData.url.trim(),
          label: formData.label.trim(),
          isEnabled: bang.isEnabled,
        })
      }
    }
  }

  const isEditingDefault =
    mode === "edit" &&
    bang !== null &&
    bang !== undefined &&
    bang.isDefault &&
    !bang.id

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Create Custom Bang"
              : isEditingDefault
                ? "Customize Default Bang"
                : "Edit Bang"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 px-6 pb-4">
          {isEditingDefault && (
            <p className="text-muted-foreground text-sm">
              Editing a default bang will create a custom override that takes
              precedence over the default.
            </p>
          )}
          <Field>
            <FieldLabel>Shortcut</FieldLabel>
            {mode === "create" && (
              <FieldDescription>
                Alphanumeric characters only (e.g., gh, mw, mysite)
              </FieldDescription>
            )}
            <Input
              placeholder="gh"
              value={formData.shortcut}
              onChange={(e) =>
                setFormData({ ...formData, shortcut: e.target.value })
              }
              disabled={isEditingDefault}
            />
          </Field>
          <Field>
            <FieldLabel>Label</FieldLabel>
            <Input
              placeholder="GitHub"
              value={formData.label}
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
            />
          </Field>
          <Field>
            <FieldLabel>URL</FieldLabel>
            {mode === "create" && (
              <FieldDescription>
                Include {"{query}"} where the search term should go
              </FieldDescription>
            )}
            <Input
              placeholder="https://github.com/search?q={query}"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
            />
          </Field>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button
            onClick={handleSubmit}
            disabled={
              !formData.shortcut ||
              !formData.url ||
              !formData.label ||
              isPending
            }
          >
            {mode === "create"
              ? "Create"
              : isEditingDefault
                ? "Create Override"
                : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default BangFormDialog
