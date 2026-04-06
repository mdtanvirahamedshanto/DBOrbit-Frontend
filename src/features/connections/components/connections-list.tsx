"use client";

import { Database, PlugZap, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useConnections } from "@/features/connections/hooks/use-connections";

export function ConnectionsList() {
  const {
    profiles,
    activeConnectionId,
    setActiveConnectionId,
    deleteConnection
  } = useConnections();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Connections</p>
        <Badge variant="outline">{profiles.length}</Badge>
      </div>

      <ScrollArea className="min-h-0 flex-1 pr-1">
        <div className="space-y-2">
          {profiles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 bg-secondary/20 p-4 text-sm text-muted-foreground">
              Add a connection to start browsing databases, collections, and tables.
            </div>
          ) : null}

          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={cn(
                "group flex items-start gap-3 rounded-2xl border px-3 py-3 transition",
                activeConnectionId === profile.id
                  ? "border-primary/30 bg-primary/10"
                  : "border-border/80 bg-secondary/25 hover:bg-secondary/50"
              )}
            >
              <div className="mt-0.5 rounded-xl bg-background/80 p-2">
                {profile.hasLiveUri ? (
                  <PlugZap className="h-4 w-4 text-primary" />
                ) : (
                  <Database className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              <button
                onClick={() => setActiveConnectionId(profile.id)}
                className="focus-ring min-w-0 flex-1 rounded-xl text-left"
              >
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-foreground">{profile.name}</p>
                  <Badge variant="secondary" className="shrink-0">
                    {profile.type}
                  </Badge>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">{profile.redactedUri}</p>
              </button>

              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 opacity-0 transition group-hover:opacity-100"
                onClick={(event) => {
                  event.stopPropagation();
                  deleteConnection(profile.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
