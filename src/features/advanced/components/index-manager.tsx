"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { queryKeys } from "@/lib/query-keys";
import { createIndex, deleteIndex, getIndexes } from "@/services/advanced-service";
import { ConnectionProfile, ResourceTarget } from "@/types";

export function IndexManager({
  connection,
  resource
}: {
  connection?: ConnectionProfile;
  resource?: ResourceTarget;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [keys, setKeys] = useState("");
  const [unique, setUnique] = useState(false);

  const query = useQuery({
    queryKey: queryKeys.indexes(connection?.id, resource?.resourceId),
    queryFn: () => getIndexes(connection!, resource!),
    enabled: Boolean(connection && resource)
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createIndex(connection!, resource!, {
        name,
        keys: keys
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        unique,
        type: connection?.type === "mongodb" ? "compound" : "btree"
      }),
    onSuccess: async () => {
      setName("");
      setKeys("");
      setUnique(false);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.indexes(connection?.id, resource?.resourceId)
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (indexId: string) => deleteIndex(connection!, resource!, indexId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.indexes(connection?.id, resource?.resourceId)
      });
    }
  });

  return (
    <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <CardHeader>
          <CardTitle>Create Index</CardTitle>
          <CardDescription>
            Optimize hot query paths without leaving the resource workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Index name</label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="orders_customer_id_idx"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Keys</label>
            <Input
              value={keys}
              onChange={(event) => setKeys(event.target.value)}
              placeholder="customer_id, created_at"
            />
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-border/80 bg-secondary/20 px-3 py-3 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={unique}
              onChange={(event) => setUnique(event.target.checked)}
              className="h-4 w-4 rounded border-border bg-background"
            />
            Enforce uniqueness
          </label>

          <Button
            onClick={() => createMutation.mutate()}
            disabled={!name.trim() || !keys.trim() || !connection || !resource}
          >
            Create Index
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Indexes</CardTitle>
          <CardDescription>
            Review index coverage and prune what no longer serves current workloads.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {query.data?.map((index) => (
            <div
              key={index.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border/80 bg-secondary/20 p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{index.name}</p>
                  {index.unique ? <Badge>Unique</Badge> : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {index.keys.join(", ")} • {index.type ?? "btree"}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteMutation.mutate(index.id)}
              >
                Delete
              </Button>
            </div>
          ))}

          {!query.data?.length ? (
            <div className="rounded-2xl border border-dashed border-border/80 bg-secondary/20 p-4 text-sm text-muted-foreground">
              No indexes found for this resource.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
