"use client";

import { Command, LayoutPanelLeft, Plus, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConnectionSwitcher } from "@/features/connections/components/connection-switcher";
import { useUiStore } from "@/store/ui-store";

export function TopBar({ onRefresh }: { onRefresh: () => void }) {
  const activeResource = useUiStore((state) => state.activeResource);
  const openRecordDialog = useUiStore((state) => state.openRecordDialog);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);

  return (
    <header className="panel-surface sticky top-0 z-20 flex flex-col gap-4 border border-border/80 px-4 py-4 shadow-panel lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="icon"
          className="lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <LayoutPanelLeft className="h-4 w-4" />
        </Button>

        <div>
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold">DBOrbit Console</p>
            {activeResource ? <Badge>{activeResource.kind}</Badge> : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {activeResource
              ? `${activeResource.database}${
                  activeResource.schema ? ` / ${activeResource.schema}` : ""
                } / ${activeResource.entity}`
              : "Select a database resource to inspect records, schema, and indexes."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ConnectionSwitcher />

        <Button variant="secondary" size="sm" onClick={onRefresh}>
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
        <Button size="sm" onClick={() => openRecordDialog()} disabled={!activeResource}>
          <Plus className="h-4 w-4" />
          Insert
        </Button>
        <div className="hidden items-center gap-2 rounded-xl border border-border/80 bg-secondary/40 px-3 py-2 text-xs text-muted-foreground xl:flex">
          <Command className="h-3.5 w-3.5" />
          `Ctrl/Cmd+K` add connection
        </div>
      </div>
    </header>
  );
}
