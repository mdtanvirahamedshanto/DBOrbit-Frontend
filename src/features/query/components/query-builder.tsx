"use client";

import { useEffect } from "react";
import { Loader2, Play, Plus, WandSparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeEditor } from "@/components/ui/code-editor";
import { Separator } from "@/components/ui/separator";
import { createEmptyRule, useQueryBuilder } from "@/features/query/hooks/use-query-builder";
import { FilterRuleRow } from "@/features/query/components/filter-rule-row";
import { ConnectionProfile, ResourceTarget } from "@/types";

export function QueryBuilder({
  connectionId,
  connection,
  resource,
  fields
}: {
  connectionId?: string;
  connection?: ConnectionProfile;
  resource?: ResourceTarget;
  fields: string[];
}) {
  const builder = useQueryBuilder(connectionId, connection, resource);

  useEffect(() => {
    const run = () => builder.canRun && builder.runQuery();
    const focus = () => {
      const target = document.querySelector<HTMLInputElement>("[data-query-first-field]");
      target?.focus();
    };

    window.addEventListener("dborbit:run-query", run);
    window.addEventListener("dborbit:focus-query-builder", focus);

    return () => {
      window.removeEventListener("dborbit:run-query", run);
      window.removeEventListener("dborbit:focus-query-builder", focus);
    };
  }, [builder]);

  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Query Builder</CardTitle>
            <CardDescription>
              Start with structured filters, then drop into Monaco for advanced execution when
              you need more control.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={builder.advancedMode ? "default" : "secondary"}>
              {builder.advancedMode ? "Advanced" : "Visual"}
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => builder.setAdvancedMode(!builder.advancedMode)}
            >
              <WandSparkles className="h-4 w-4" />
              Toggle Mode
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {!builder.advancedMode ? (
            <>
              {builder.rules.map((rule, index) => (
                <div key={rule.id}>
                  <FilterRuleRow
                    rule={rule}
                    fields={fields}
                    autoFocusTarget={index === 0}
                    onChange={(nextRule) =>
                      builder.setRules((current) =>
                        current.map((item) => (item.id === rule.id ? nextRule : item))
                      )
                    }
                    onDelete={() =>
                      builder.setRules((current) =>
                        current.length === 1
                          ? [createEmptyRule()]
                          : current.filter((item) => item.id !== rule.id)
                      )
                    }
                  />
                </div>
              ))}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => builder.setRules((current) => [...current, createEmptyRule()])}
              >
                <Plus className="h-4 w-4" />
                Add filter
              </Button>
            </>
          ) : (
            <CodeEditor
              language={connection?.type === "mongodb" ? "json" : "sql"}
              value={
                builder.advancedQuery ||
                (connection?.type === "mongodb"
                  ? `{\n  "status": "active"\n}`
                  : `SELECT * FROM ${resource?.entity ?? "table"}\nWHERE status = 'active';`)
              }
              onChange={builder.setAdvancedQuery}
              height={320}
            />
          )}

          <Button onClick={builder.runQuery} disabled={!builder.canRun || builder.isRunning}>
            {builder.isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Run Query
          </Button>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Execution Preview</CardTitle>
          <CardDescription>
            Preview generated query text and the first matching result set without leaving the
            workbench.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="rounded-2xl border border-border/80 bg-background/30 p-3">
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Generated query
              </p>
              <CodeEditor
                height={180}
                language={connection?.type === "mongodb" ? "json" : "sql"}
                value={builder.queryResult?.generatedQuery ?? "// Run a query to generate output"}
                readOnly
              />
            </div>

            <Separator />

            <div className="rounded-2xl border border-border/80 bg-background/30 p-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Preview documents
                </p>
                <Badge variant="secondary">{builder.queryResult?.total ?? 0} rows</Badge>
              </div>
              <CodeEditor
                height={260}
                language="json"
                value={JSON.stringify(builder.queryResult?.preview ?? [], null, 2)}
                readOnly
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
