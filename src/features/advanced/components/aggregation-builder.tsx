"use client";

import { useEffect, useState } from "react";
import { Loader2, Play, Plus, Sparkles, Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeEditor } from "@/components/ui/code-editor";
import { ConnectionProfile, ResourceTarget } from "@/types";
import { runAggregation } from "@/services/advanced-service";

const stageTemplates = [
  { stage: "$match", value: '{\n  "plan": "pro"\n}' },
  { stage: "$sort", value: '{\n  "createdAt": -1\n}' },
  { stage: "$limit", value: '{\n  "limit": 10\n}' },
  { stage: "$project", value: '{\n  "name": 1,\n  "email": 1,\n  "_id": 0\n}' }
];

export function AggregationBuilder({
  connectionId,
  connection,
  resource
}: {
  connectionId?: string;
  connection?: ConnectionProfile;
  resource?: ResourceTarget;
}) {
  const [stages, setStages] = useState([
    {
      id: crypto.randomUUID(),
      stage: "$match",
      value: '{\n  "active": true\n}'
    }
  ]);

  const mutation = useMutation({
    mutationFn: () => runAggregation(connectionId!, resource!, stages)
  });

  useEffect(() => {
    const run = () => {
      if (connectionId && connection && resource) {
        mutation.mutate();
      }
    };

    window.addEventListener("dborbit:run-aggregation", run);
    return () => window.removeEventListener("dborbit:run-aggregation", run);
  }, [connection, connectionId, mutation, resource, stages]);

  if (connection?.type !== "mongodb") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aggregation Builder</CardTitle>
          <CardDescription>
            Aggregation pipelines are available for MongoDB connections only.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>MongoDB Aggregation Pipeline</CardTitle>
          <CardDescription>
            Compose stages visually, seed them from templates, and run the pipeline without
            dropping into a terminal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {stageTemplates.map((template) => (
              <Button
                key={template.stage}
                size="sm"
                variant="secondary"
                onClick={() =>
                  setStages((current) => [
                    ...current,
                    { id: crypto.randomUUID(), stage: template.stage, value: template.value }
                  ])
                }
              >
                <Sparkles className="h-4 w-4" />
                {template.stage}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {stages.map((stage) => (
              <div key={stage.id} className="rounded-2xl border border-border/80 bg-secondary/20 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <select
                    value={stage.stage}
                    onChange={(event) =>
                      setStages((current) =>
                        current.map((item) =>
                          item.id === stage.id ? { ...item, stage: event.target.value } : item
                        )
                      )
                    }
                    className="focus-ring h-10 rounded-xl border border-input bg-background/40 px-3 text-sm"
                  >
                    {stageTemplates.map((template) => (
                      <option key={template.stage} value={template.stage}>
                        {template.stage}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      setStages((current) => current.filter((item) => item.id !== stage.id))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <CodeEditor
                  height={180}
                  language="json"
                  value={stage.value}
                  onChange={(value) =>
                    setStages((current) =>
                      current.map((item) => (item.id === stage.id ? { ...item, value } : item))
                    )
                  }
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setStages((current) => [
                  ...current,
                  { id: crypto.randomUUID(), stage: "$match", value: "{\n\n}" }
                ])
              }
            >
              <Plus className="h-4 w-4" />
              Add stage
            </Button>

            <Button onClick={() => mutation.mutate()} disabled={!connectionId || !connection || !resource}>
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Run Pipeline
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline Preview</CardTitle>
          <CardDescription>Inspect transformed output before persisting any changes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{mutation.data?.length ?? 0} documents</Badge>
          </div>
          <CodeEditor
            language="json"
            value={JSON.stringify(mutation.data ?? [], null, 2)}
            height="70vh"
            readOnly
          />
        </CardContent>
      </Card>
    </div>
  );
}
