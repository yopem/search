"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toastManager } from "@/components/ui/toast"

interface BangImportDialogProps {
  isOpen: boolean
  onClose: () => void
  onImport: (data: unknown, mode: "skip" | "replace") => void
  isPending: boolean
}

const BangImportDialog = ({
  isOpen,
  onClose,
  onImport,
  isPending,
}: BangImportDialogProps) => {
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importMode, setImportMode] = useState<"skip" | "replace">("skip")

  const handleImport = async () => {
    if (!importFile) return

    try {
      const text = await importFile.text()
      const data = JSON.parse(text)
      onImport(data, importMode)
      setImportFile(null)
    } catch {
      toastManager.add({
        title: "Invalid file",
        description: "The selected file is not a valid JSON file",
      })
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setImportFile(null)
          onClose()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Bangs</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 px-6 pb-4">
          <Field>
            <FieldLabel>JSON File</FieldLabel>
            <Input
              type="file"
              accept=".json"
              onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
            />
          </Field>
          <Field>
            <FieldLabel>Import Mode</FieldLabel>
            <div className="flex gap-2">
              <Button
                variant={importMode === "skip" ? "default" : "outline"}
                onClick={() => setImportMode("skip")}
              >
                Skip Duplicates
              </Button>
              <Button
                variant={importMode === "replace" ? "default" : "outline"}
                onClick={() => setImportMode("replace")}
              >
                Replace Duplicates
              </Button>
            </div>
          </Field>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button onClick={handleImport} disabled={!importFile || isPending}>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default BangImportDialog
