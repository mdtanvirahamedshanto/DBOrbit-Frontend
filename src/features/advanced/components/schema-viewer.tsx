"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3, Binary, CircleOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { queryKeys } from "@/lib/query-keys";
import { getSchema } from "@/services/advanced-service";
import { ConnectionProfile, ResourceTarget } from "@/types";

export function SchemaViewer({
  connection,
  resource
}: {
  connection?: ConnectionProfile;
  resource?: ResourceTarget;
}) {
  const query = useQuery({
    queryKey: queryKeys.schema(connection?.id, resource?.resourceId),
    queryFn: () => getSchema(connection!, resource!),
    enabled: Boolean(connection && resource)
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schema Intelligence</CardTitle>
        <CardDescription>
          Field types and frequency stats help you spot optional fields, unstable shapes, and
          schema drift quickly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {query.data?.map((field) => (
          <div
            key={field.field}
            className="grid gap-3 rounded-2xl border border-border/80 bg-secondary/20 p-4 md:grid-cols-[1.5fr_0.8fr_0.8fr_2fr]"
          >
            <div>
              <p className="font-medium text-foreground">{field.field}</p>
              <p className="mt-1 text-sm text-muted-foreground">{field.sample}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Binary className="h-4 w-4 text-primary" />
              {field.type}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4 text-accent" />
              {field.frequency} hits
            </div>
            <div className="flex items-center justify-between gap-3">
              <Badge variant={field.nullable ? "outline" : "secondary"}>
                {field.nullable ? "Nullable" : "Required"}
              </Badge>
              {field.nullable ? <CircleOff className="h-4 w-4 text-muted-foreground" /> : null}
            </div>
          </div>
        ))}

        {!query.data?.length ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-secondary/20 p-4 text-sm text-muted-foreground">
            No schema stats are available for the current resource yet.
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
