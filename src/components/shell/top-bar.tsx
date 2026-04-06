"use client";

import {
  Activity,
  Command,
  LayoutPanelLeft,
  Pin,
  Plus,
  RefreshCcw,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConnectionSwitcher } from "@/features/connections/components/connection-switcher";
import { useUiStore } from "@/store/ui-store";
import { useConnections } from "@/features/connections/hooks/use-connections";
import { useWorkspaceStore } from "@/store/workspace-store";

export function TopBar({ onRefresh }: { onRefresh: () => void }) {
  const activeResource = useUiStore((state) => state.activeResource);
  const openRecordDialog = useUiStore((state) => state.openRecordDialog);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const { activeConnection, activeProfileId, connectionStatus } = useConnections();
  const pinnedResources = useWorkspaceStore((state) => state.pinnedResources);
  const togglePinnedResource = useWorkspaceStore((state) => state.togglePinnedResource);

  const isPinned = Boolean(
    activeProfileId &&
      activeResource &&
      pinnedResources.some(
        (item) =>
          item.profileId === activeProfileId &&
          item.resource.resourceId === activeResource.resourceId
      )
  );

  return (
    <header className="panel-surface panel-premium sticky top-0 z-20 overflow-hidden border border-border/80 px-4 py-4 shadow-panel">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(16,185,129,0.06),transparent_35%,rgba(56,189,248,0.06))]" />

      <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-3">
          <Button
            variant="secondary"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <LayoutPanelLeft className="h-4 w-4" />
          </Button>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="glass-chip">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Premium Workspace
              </span>
              <span className="glass-chip">
                <Activity className="h-3.5 w-3.5 text-accent" />
                {connectionStatus === "connected"
                  ? "Live session"
                  : connectionStatus === "connecting"
                    ? "Connecting"
                    : "Idle"}
              </span>
              {activeResource ? <Badge>{activeResource.kind}</Badge> : null}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xl font-semibold tracking-tight">DBOrbit Console</p>
                {activeConnection ? (
                  <Badge variant="secondary" className="normal-case tracking-normal">
                    {activeConnection.name}
                  </Badge>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeResource
                  ? `${activeResource.database}${
                      activeResource.schema ? ` / ${activeResource.schema}` : ""
                    } / ${activeResource.entity}`
                  : "Select a database resource to inspect records, schema, indexes, and queries."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ConnectionSwitcher />

          {activeProfileId && activeResource ? (
            <Button
              variant={isPinned ? "default" : "secondary"}
              size="sm"
              onClick={() =>
                togglePinnedResource({
                  profileId: activeProfileId,
                  profileName: activeConnection?.name,
                  resource: activeResource
                })
              }
            >
              <Pin className="h-4 w-4" />
              {isPinned ? "Pinned" : "Pin"}
            </Button>
          ) : null}

          <Button variant="secondary" size="sm" onClick={onRefresh}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => openRecordDialog()} disabled={!activeResource}>
            <Plus className="h-4 w-4" />
            Insert
          </Button>
          <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-muted-foreground xl:flex">
            <Command className="h-3.5 w-3.5" />
            `Ctrl/Cmd+K` add connection
          </div>
        </div>
      </div>
    </header>
  );
}
