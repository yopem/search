"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface BangConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  mode: "delete" | "reset"
  onConfirm: () => void
  isPending: boolean
}

const BangConfirmDialog = ({
  isOpen,
  onClose,
  mode,
  onConfirm,
  isPending,
}: BangConfirmDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "delete" ? "Delete Bang" : "Reset All Custom Bangs"}
          </DialogTitle>
        </DialogHeader>
        <p className="px-6 pb-4">
          {mode === "delete"
            ? "Are you sure you want to delete this bang? This action cannot be undone."
            : "This will delete all your custom bangs. This action cannot be undone."}
        </p>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {mode === "delete" ? "Delete" : "Reset All"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default BangConfirmDialog
