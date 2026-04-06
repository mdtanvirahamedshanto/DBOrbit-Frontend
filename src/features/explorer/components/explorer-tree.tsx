"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Database,
  FolderTree,
  RefreshCcw,
  Table2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useExplorerTree } from "@/features/explorer/hooks/use-explorer-tree";
import { useUiStore } from "@/store/ui-store";
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

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const leafNodes = useMemo(() => flattenResourceNodes(data ?? []), [data]);

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
      if (Object.keys(current).length > 0) {
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

      visit(data);
      return next;
    });
  }, [data]);

  return (
    <div className="flex min-h-0 flex-col">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">Explorer</p>
        <Badge variant="outline">{leafNodes.length}</Badge>
      </div>

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

        <div className="space-y-1">
          {(data ?? []).map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              depth={0}
              expanded={expanded}
              toggleExpanded={(nodeId) =>
                setExpanded((current) => ({ ...current, [nodeId]: !current[nodeId] }))
              }
              activeResourceId={activeResource?.resourceId}
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
  onSelect
}: {
  node: ExplorerNode;
  depth: number;
  expanded: Record<string, boolean>;
  toggleExpanded: (nodeId: string) => void;
  activeResourceId?: string;
  onSelect: (node: ExplorerNode) => void;
}) {
  const hasChildren = Boolean(node.children?.length);
  const isExpanded = expanded[node.id];
  const isActive = activeResourceId === node.resourceId;

  return (
    <div>
      <button
        onClick={() => (hasChildren ? toggleExpanded(node.id) : onSelect(node))}
        onDoubleClick={() => node.resourceId && onSelect(node)}
        className={cn(
          "focus-ring flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm transition",
          isActive
            ? "bg-primary/10 text-foreground"
            : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
        )}
        style={{ paddingLeft: depth * 14 + 8 }}
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
