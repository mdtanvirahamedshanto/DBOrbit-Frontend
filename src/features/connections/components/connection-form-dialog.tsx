"use client";

import { useState } from "react";
import { DatabaseZap, ShieldCheck } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { useConnections } from "@/features/connections/hooks/use-connections";
import { validateConnection } from "@/services/connection-service";
import { useUiStore } from "@/store/ui-store";
import { DatabaseType } from "@/types";

const databaseTypes: Array<{ label: string; value: DatabaseType }> = [
  { label: "MongoDB", value: "mongodb" },
  { label: "PostgreSQL", value: "postgresql" },
  { label: "MySQL", value: "mysql" }
];

export function ConnectionFormDialog() {
  const open = useUiStore((state) => state.connectionDialogOpen);
  const setOpen = useUiStore((state) => state.setConnectionDialogOpen);
  const { saveConnection } = useConnections();

  const [name, setName] = useState("");
  const [type, setType] = useState<DatabaseType>("mongodb");
  const [uri, setUri] = useState("");
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!name.trim() || !uri.trim()) {
      toast.error("Name and URI are required");
      return;
    }

    setTesting(true);

    try {
      const result = await validateConnection({
        id: "preview",
        name,
        type,
        redactedUri: uri,
        uri,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      if (!result.success) {
        toast.error("Connection test failed");
        return;
      }

      setSaving(true);
      saveConnection({ name, type, uri });
      toast.success(`Connection saved${result.latencyMs ? ` in ${result.latencyMs}ms` : ""}`);
      setName("");
      setUri("");
      setType("mongodb");
      setOpen(false);
    } finally {
      setTesting(false);
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DatabaseZap className="h-5 w-5 text-primary" />
            Add Connection Profile
          </DialogTitle>
          <DialogDescription>
            Credentials stay in session storage only. Local persistence keeps safe metadata so
            you can restore profiles without permanently storing secrets.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="connection-name">
              Display name
            </label>
            <Input
              id="connection-name"
              placeholder="Production Analytics"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="connection-type">
              Database type
            </label>
            <select
              id="connection-type"
              value={type}
              onChange={(event) => setType(event.target.value as DatabaseType)}
              className="focus-ring h-10 rounded-xl border border-input bg-background/40 px-3 text-sm"
            >
              {databaseTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="connection-uri">
              Connection URI
            </label>
            <Input
              id="connection-uri"
              type="password"
              placeholder="mongodb+srv://..."
              value={uri}
              onChange={(event) => setUri(event.target.value)}
            />
            <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Sensitive URI data is kept in session scope instead of permanent browser storage.
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={testing || saving}>
            {testing || saving ? "Saving..." : "Test & Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
