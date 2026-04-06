"use client";

import { ChevronDown, Database, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useConnections } from "@/features/connections/hooks/use-connections";
import { useUiStore } from "@/store/ui-store";

export function ConnectionSwitcher() {
  const { profiles, activeConnectionId, setActiveConnectionId, activeConnection } =
    useConnections();
  const setConnectionDialogOpen = useUiStore((state) => state.setConnectionDialogOpen);

  return (
    <div className="flex items-center gap-3">
      <div className="relative min-w-[220px]">
        <Database className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
        <select
          value={activeConnectionId ?? ""}
          onChange={(event) => setActiveConnectionId(event.target.value || undefined)}
          className="focus-ring h-11 w-full appearance-none rounded-xl border border-border/80 bg-secondary/60 pl-9 pr-10 text-sm"
        >
          <option value="">Select connection</option>
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      {activeConnection ? (
        <Badge variant="secondary">{activeConnection.type}</Badge>
      ) : (
        <Badge variant="outline">No live connection</Badge>
      )}

      <Button variant="secondary" size="sm" onClick={() => setConnectionDialogOpen(true)}>
        <Plus className="h-4 w-4" />
        Add
      </Button>
    </div>
  );
}
