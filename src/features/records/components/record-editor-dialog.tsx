"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { CodeEditor } from "@/components/ui/code-editor";
import { useUiStore } from "@/store/ui-store";

export function RecordEditorDialog({
  draft,
  setDraft,
  onSave,
  title
}: {
  draft: string;
  setDraft: (value: string) => void;
  onSave: () => Promise<void>;
  title: string;
}) {
  const open = useUiStore((state) => state.recordDialogOpen);
  const closeRecordDialog = useUiStore((state) => state.closeRecordDialog);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && closeRecordDialog()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Edit the payload directly in JSON. Invalid JSON is rejected before any mutation runs.
          </DialogDescription>
        </DialogHeader>

        <CodeEditor value={draft} onChange={setDraft} height="60vh" />

        <DialogFooter>
          <Button variant="secondary" onClick={() => closeRecordDialog()}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              try {
                JSON.parse(draft);
              } catch {
                toast.error("Payload must be valid JSON");
                return;
              }

              await onSave();
            }}
          >
            Save record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
