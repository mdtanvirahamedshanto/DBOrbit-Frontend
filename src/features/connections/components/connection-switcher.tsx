"use client";

import { ChevronDown, Database, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useConnections } from "@/features/connections/hooks/use-connections";
import { useUiStore } from "@/store/ui-store";

export function ConnectionSwitcher() {
  const {
    profiles,
    activeProfileId,
    openLiveConnection,
    activeConnection,
    connectionStatus
  } =
    useConnections();
  const setConnectionDialogOpen = useUiStore((state) => state.setConnectionDialogOpen);

  return (
    <div className="flex items-center gap-3">
      <div className="relative min-w-[240px]">
        <Database className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
        <select
          value={activeProfileId ?? ""}
          onChange={(event) => {
            if (event.target.value) {
              void openLiveConnection(event.target.value);
            }
          }}
          className="focus-ring h-11 w-full appearance-none rounded-xl border border-white/10 bg-white/[0.05] pl-9 pr-10 text-sm"
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
        <Badge variant="secondary" className="normal-case tracking-normal">
          {connectionStatus === "connecting" ? "Connecting..." : activeConnection.type}
        </Badge>
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
