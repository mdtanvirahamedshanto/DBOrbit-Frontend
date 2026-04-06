"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Clock3,
  Database,
  FolderTree,
  Pin,
  RefreshCcw,
  Search,
  Star,
  Table2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useExplorerTree } from "@/features/explorer/hooks/use-explorer-tree";
import { useUiStore } from "@/store/ui-store";
import { useConnections } from "@/features/connections/hooks/use-connections";
import { useWorkspaceStore } from "@/store/workspace-store";
import { ConnectionProfile, ExplorerNode, ResourceTarget } from "@/types";

function toResourceTarget(node: ExplorerNode): ResourceTarget | undefined {
  if (!node.resourceId) {
    return undefined;
  }

  if (node.kind === "collection") {
    return {
      database: node.path[0],
      entity: node.path[1],
      kind: "collection",
      resourceId: node.resourceId
    };
  }

  return {
    database: node.path[0],
    schema: node.path[1],
    entity: node.path[2],
    kind: node.kind === "view" ? "view" : "table",
    resourceId: node.resourceId
  };
}

function flattenResourceNodes(nodes: ExplorerNode[]): ExplorerNode[] {
  return nodes.flatMap((node) => {
    if (node.resourceId) {
      return [node];
    }

    return flattenResourceNodes(node.children ?? []);
  });
}

function filterTree(nodes: ExplorerNode[], term: string): ExplorerNode[] {
  const normalized = term.trim().toLowerCase();

  if (!normalized) {
    return nodes;
  }

  return nodes.flatMap((node) => {
    const matchesSelf = [node.name, ...node.path].join(" ").toLowerCase().includes(normalized);
    const filteredChildren = filterTree(node.children ?? [], term);

    if (matchesSelf || filteredChildren.length > 0) {
      return [
        {
          ...node,
          children: filteredChildren
        }
      ];
    }

    return [];
  });
}

function ResourceShortcut({
  label,
  resource,
  active,
  onSelect,
  onPinToggle,
  pinned
}: {
  label: string;
  resource: ResourceTarget;
  active: boolean;
  onSelect: (resource: ResourceTarget) => void;
  onPinToggle: (resource: ResourceTarget) => void;
  pinned?: boolean;
}) {
  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-2xl border px-3 py-3 transition",
        active
          ? "border-primary/30 bg-primary/10"
          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
      )}
    >
      <button className="min-w-0 flex-1 text-left" onClick={() => onSelect(resource)}>
        <p className="truncate text-sm font-medium text-foreground">{resource.entity}</p>
        <p className="truncate text-xs text-muted-foreground">{label}</p>
      </button>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 opacity-60 transition group-hover:opacity-100"
        onClick={() => onPinToggle(resource)}
      >
        <Star className={cn("h-4 w-4", pinned ? "fill-primary text-primary" : "")} />
      </Button>
    </div>
  );
}

export function ExplorerTree({
  connection,
  connectionId
}: {
  connection?: ConnectionProfile;
  connectionId?: string;
}) {
  const { data, isLoading, isError, refetch } = useExplorerTree(connectionId, connection?.type);
  const activeResource = useUiStore((state) => state.activeResource);
  const setActiveResource = useUiStore((state) => state.setActiveResource);
  const { activeProfileId } = useConnections();
  const pinnedResources = useWorkspaceStore((state) => state.pinnedResources);
  const recentResources = useWorkspaceStore((state) => state.recentResources);
  const togglePinnedResource = useWorkspaceStore((state) => state.togglePinnedResource);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const leafNodes = useMemo(() => flattenResourceNodes(data ?? []), [data]);
  const filteredData = useMemo(() => filterTree(data ?? [], search), [data, search]);

  const pinnedForProfile = useMemo(
    () => pinnedResources.filter((item) => item.profileId === activeProfileId),
    [activeProfileId, pinnedResources]
  );
  const recentForProfile = useMemo(
    () => recentResources.filter((item) => item.profileId === activeProfileId),
    [activeProfileId, recentResources]
  );

  useEffect(() => {
    if (!activeResource && leafNodes.length > 0) {
      setActiveResource(toResourceTarget(leafNodes[0]));
    }
  }, [activeResource, leafNodes, setActiveResource]);

  useEffect(() => {
    if (!data) {
      return;
    }

    setExpanded((current) => {
      if (Object.keys(current).length > 0 && !search.trim()) {
        return current;
      }

      const next: Record<string, boolean> = {};

      const visit = (nodes: ExplorerNode[]) => {
        for (const node of nodes) {
          if (node.children?.length) {
            next[node.id] = true;
            visit(node.children);
          }
        }
      };

      visit(search.trim() ? filteredData : data);
      return next;
    });
  }, [data, filteredData, search]);

  function togglePin(resource: ResourceTarget) {
    if (!activeProfileId) {
      return;
    }

    togglePinnedResource({
      profileId: activeProfileId,
      profileName: connection?.name,
      resource
    });
  }

  return (
    <div className="flex min-h-0 flex-col">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Explorer</p>
          <p className="text-xs text-muted-foreground">Search, pin, and jump across resources</p>
        </div>
        <Badge variant="outline">{leafNodes.length}</Badge>
      </div>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search databases, schemas, tables..."
          className="pl-9"
        />
      </div>

      {pinnedForProfile.length > 0 ? (
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <Pin className="h-3.5 w-3.5" />
            Pinned
          </div>
          <div className="space-y-2">
            {pinnedForProfile.slice(0, 4).map((item) => (
              <ResourceShortcut
                key={`${item.profileId}:${item.resource.resourceId}`}
                label={`${item.resource.database}${item.resource.schema ? ` / ${item.resource.schema}` : ""}`}
                resource={item.resource}
                active={activeResource?.resourceId === item.resource.resourceId}
                onSelect={setActiveResource}
                onPinToggle={togglePin}
                pinned
              />
            ))}
          </div>
        </div>
      ) : null}

      {recentForProfile.length > 0 ? (
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5" />
            Recent
          </div>
          <div className="flex flex-wrap gap-2">
            {recentForProfile.slice(0, 5).map((item) => (
              <button
                key={`${item.profileId}:${item.resource.resourceId}:recent`}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition",
                  activeResource?.resourceId === item.resource.resourceId
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setActiveResource(item.resource)}
              >
                {item.resource.entity}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <ScrollArea className="min-h-0 flex-1 pr-1">
        {isLoading ? (
          <div className="rounded-2xl border border-border/80 bg-secondary/25 p-4 text-sm text-muted-foreground">
            Loading databases and collections...
          </div>
        ) : null}

        {!isLoading && !connection ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-secondary/20 p-4 text-sm text-muted-foreground">
            Select a connection to inspect its databases and collections.
          </div>
        ) : null}

        {isError ? (
          <div className="space-y-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm text-muted-foreground">
              The explorer could not load. Check the connection and try again.
            </p>
            <Button size="sm" variant="secondary" onClick={() => void refetch()}>
              <RefreshCcw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : null}

        {!isLoading && !isError && filteredData.length === 0 && search.trim() ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-secondary/20 p-4 text-sm text-muted-foreground">
            No resources matched “{search}”.
          </div>
        ) : null}

        <div className="space-y-1">
          {filteredData.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              depth={0}
              expanded={expanded}
              toggleExpanded={(nodeId) =>
                setExpanded((current) => ({ ...current, [nodeId]: !current[nodeId] }))
              }
              activeResourceId={activeResource?.resourceId}
              isPinned={(resourceId) =>
                pinnedForProfile.some((item) => item.resource.resourceId === resourceId)
              }
              onTogglePin={(selectedNode) => {
                const target = toResourceTarget(selectedNode);

                if (target) {
                  togglePin(target);
                }
              }}
              onSelect={(selectedNode) => setActiveResource(toResourceTarget(selectedNode))}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function TreeNode({
  node,
  depth,
  expanded,
  toggleExpanded,
  activeResourceId,
  onSelect,
  isPinned,
  onTogglePin
}: {
  node: ExplorerNode;
  depth: number;
  expanded: Record<string, boolean>;
  toggleExpanded: (nodeId: string) => void;
  activeResourceId?: string;
  onSelect: (node: ExplorerNode) => void;
  isPinned: (resourceId?: string) => boolean;
  onTogglePin: (node: ExplorerNode) => void;
}) {
  const hasChildren = Boolean(node.children?.length);
  const isExpanded = expanded[node.id];
  const isActive = activeResourceId === node.resourceId;

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-2 rounded-xl px-2 py-2 text-sm transition",
          isActive
            ? "bg-primary/10 text-foreground"
            : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
        )}
        style={{ paddingLeft: depth * 14 + 8 }}
      >
        <button
          onClick={() => (hasChildren ? toggleExpanded(node.id) : onSelect(node))}
          onDoubleClick={() => node.resourceId && onSelect(node)}
          className="focus-ring flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            )
          ) : (
            <span className="h-4 w-4 shrink-0" />
          )}

          <NodeIcon kind={node.kind} />
          <span className="truncate">{node.name}</span>
        </button>

        {node.resourceId ? (
          <button
            className="opacity-0 transition group-hover:opacity-100"
            onClick={() => onTogglePin(node)}
            aria-label="Toggle pin"
          >
            <Star
              className={cn(
                "h-4 w-4",
                isPinned(node.resourceId)
                  ? "fill-primary text-primary opacity-100"
                  : "text-muted-foreground"
              )}
            />
          </button>
        ) : null}
      </div>

      {hasChildren && isExpanded ? (
        <div className="mt-1 space-y-1">
          {node.children?.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              toggleExpanded={toggleExpanded}
              activeResourceId={activeResourceId}
              isPinned={isPinned}
              onTogglePin={onTogglePin}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function NodeIcon({ kind }: { kind: ExplorerNode["kind"] }) {
  if (kind === "database") {
    return <Database className="h-4 w-4 shrink-0 text-primary" />;
  }

  if (kind === "schema") {
    return <FolderTree className="h-4 w-4 shrink-0 text-accent" />;
  }

  return <Table2 className="h-4 w-4 shrink-0 text-amber-300" />;
}
