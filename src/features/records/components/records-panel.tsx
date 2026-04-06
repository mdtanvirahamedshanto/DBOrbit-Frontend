"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  Braces,
  ChevronLeft,
  ChevronRight,
  DatabaseZap,
  Rows3,
  RefreshCcw,
  Search
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/utils";
import { useRecordMutations, useRecords } from "@/features/records/hooks/use-records";
import { JsonRecordsView } from "@/features/records/components/json-records-view";
import { RecordEditorDialog } from "@/features/records/components/record-editor-dialog";
import { RecordsTable } from "@/features/records/components/records-table";
import { QueryBuilder } from "@/features/query/components/query-builder";
import { AggregationBuilder } from "@/features/advanced/components/aggregation-builder";
import { SchemaViewer } from "@/features/advanced/components/schema-viewer";
import { IndexManager } from "@/features/advanced/components/index-manager";
import { useUiStore } from "@/store/ui-store";
import { ConnectionProfile, DbRecord, SortState } from "@/types";

function matchesSearch(record: DbRecord, search: string) {
  if (!search.trim()) {
    return true;
  }

  const normalized = search.toLowerCase();
  return JSON.stringify(record).toLowerCase().includes(normalized);
}

export function RecordsPanel({
  connection,
  connectionId
}: {
  connection?: ConnectionProfile;
  connectionId?: string;
}) {
  const activeResource = useUiStore((state) => state.activeResource);
  const activeTab = useUiStore((state) => state.activeTab);
  const setActiveTab = useUiStore((state) => state.setActiveTab);
  const selectedRecord = useUiStore((state) => state.selectedRecord) as DbRecord | undefined;
  const recordDialogOpen = useUiStore((state) => state.recordDialogOpen);
  const closeRecordDialog = useUiStore((state) => state.closeRecordDialog);
  const openRecordDialog = useUiStore((state) => state.openRecordDialog);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sorting, setSorting] = useState<SortState[]>([]);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const [draft, setDraft] = useState("{}");

  const params = useMemo(
    () => ({
      page,
      pageSize,
      sorting,
      filters: [],
      search: deferredSearch
    }),
    [deferredSearch, page, pageSize, sorting]
  );

  const recordsQuery = useRecords(connectionId, activeResource, params);
  const mutations = useRecordMutations(connectionId, activeResource);

  useEffect(() => {
    setPage(1);
  }, [activeResource, deferredSearch]);

  const columns = recordsQuery.data?.columns ?? [];
  const rawItems = recordsQuery.data?.items ?? [];
  const items = useMemo(
    () => rawItems.filter((item) => matchesSearch(item, deferredSearch)),
    [deferredSearch, rawItems]
  );

  useEffect(() => {
    if (recordDialogOpen) {
      if (selectedRecord) {
        setDraft(JSON.stringify(selectedRecord, null, 2));
        return;
      }

      const emptyRecord = Object.fromEntries(
        columns
          .filter((column) => column.editable)
          .map((column) => [column.key, column.type.includes("boolean") ? false : ""])
      );

      setDraft(JSON.stringify(emptyRecord, null, 2));
    }
  }, [columns, recordDialogOpen, selectedRecord]);

  async function handleSaveDraft() {
    const payload = JSON.parse(draft) as DbRecord;

    if (selectedRecord) {
      await mutations.updateMutation.mutateAsync({
        currentRecord: selectedRecord,
        patch: payload
      });
    } else {
      await mutations.createMutation.mutateAsync(payload);
    }

    closeRecordDialog();
  }

  return (
    <>
      <RecordEditorDialog
        draft={draft}
        setDraft={setDraft}
        onSave={handleSaveDraft}
        title={selectedRecord ? "Edit record" : "Insert record"}
      />

      {!activeResource ? (
        <Card className="panel-premium flex flex-1 items-center justify-center">
          <CardContent className="py-16">
            <CardTitle>Select a table or collection</CardTitle>
            <CardDescription className="mt-2">
              Choose a resource from the explorer to open records, queries, schema insights, and
              index management tools.
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="grid flex-1 gap-4">
          <Card className="panel-premium workspace-grid overflow-hidden">
            <CardHeader className="flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="glass-chip">
                    <DatabaseZap className="h-3.5 w-3.5 text-primary" />
                    Live Resource
                  </span>
                  <span className="glass-chip">
                    <Rows3 className="h-3.5 w-3.5 text-accent" />
                    {recordsQuery.data?.total ?? 0} rows available
                  </span>
                </div>

                <CardTitle className="flex items-center gap-3">
                  {activeResource.entity}
                  <Badge variant="secondary">{activeResource.kind}</Badge>
                </CardTitle>
                <CardDescription>
                  {activeResource.database}
                  {activeResource.schema ? ` / ${activeResource.schema}` : ""} /{" "}
                  {activeResource.entity}. Browse records, switch to JSON, inspect schema drift,
                  and manage indexes from one workspace.
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[240px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search current page"
                    className="pl-9"
                  />
                </div>

                <select
                  value={pageSize}
                  onChange={(event) => setPageSize(Number(event.target.value))}
                  className="focus-ring h-10 rounded-xl border border-input bg-background/40 px-3 text-sm"
                >
                  {[10, 25, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size} rows
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <MetricCard
                  label="Visible records"
                  value={formatNumber(items.length)}
                  hint="Current page after search"
                />
                <MetricCard
                  label="Total matching"
                  value={formatNumber(recordsQuery.data?.total ?? 0)}
                  hint="Server-side result size"
                />
                <MetricCard
                  label="Sort keys"
                  value={String(sorting.length)}
                  hint={activeTab === "json" ? "JSON preview active" : "Table workspace active"}
                />
              </div>

              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
                <TabsList className="w-full justify-start overflow-auto rounded-2xl border border-white/10 bg-white/[0.03] p-1">
                  <TabsTrigger value="records" className="gap-2">
                    <Rows3 className="h-4 w-4" />
                    Records
                  </TabsTrigger>
                  <TabsTrigger value="json" className="gap-2">
                    <Braces className="h-4 w-4" />
                    JSON
                  </TabsTrigger>
                  <TabsTrigger value="query">Query</TabsTrigger>
                  <TabsTrigger value="aggregation">Aggregation</TabsTrigger>
                  <TabsTrigger value="schema">Schema</TabsTrigger>
                  <TabsTrigger value="indexes">Indexes</TabsTrigger>
                </TabsList>

                <TabsContent value="records" className="space-y-4">
                  {recordsQuery.isLoading ? (
                    <div className="rounded-2xl border border-border/80 bg-secondary/20 p-6 text-sm text-muted-foreground">
                      Loading records...
                    </div>
                  ) : null}

                  {recordsQuery.isError ? (
                    <div className="space-y-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
                      <p className="text-sm text-muted-foreground">
                        Records could not be loaded for this resource.
                      </p>
                      <Button size="sm" variant="secondary" onClick={() => void recordsQuery.refetch()}>
                        <RefreshCcw className="h-4 w-4" />
                        Retry
                      </Button>
                    </div>
                  ) : null}

                  {!recordsQuery.isLoading && !recordsQuery.isError && items.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/80 bg-secondary/20 p-6 text-sm text-muted-foreground">
                      No records matched the current view. Try clearing the page search, choosing
                      another resource, or refreshing the connection.
                    </div>
                  ) : null}

                  {!recordsQuery.isError ? (
                    <RecordsTable
                      columns={columns}
                      items={items}
                      sorting={sorting}
                      onSortingChange={setSorting}
                      onInlineSave={async (record, patch) => {
                        await mutations.updateMutation.mutateAsync({
                          currentRecord: record,
                          patch
                        });
                      }}
                      onEdit={(record) => openRecordDialog(record)}
                      onDelete={async (record) => {
                        await mutations.deleteMutation.mutateAsync(record);
                      }}
                    />
                  ) : null}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                      Page {page} of{" "}
                      {Math.max(1, Math.ceil((recordsQuery.data?.total ?? 0) / pageSize))}
                    </p>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                        disabled={page <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setPage((current) =>
                            current <
                            Math.ceil((recordsQuery.data?.total ?? 0) / pageSize)
                              ? current + 1
                              : current
                          )
                        }
                        disabled={
                          page >= Math.ceil((recordsQuery.data?.total ?? 0) / pageSize)
                        }
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="json">
                  <JsonRecordsView items={items} />
                </TabsContent>

                <TabsContent value="query">
                  <QueryBuilder
                    connectionId={connectionId}
                    connection={connection}
                    resource={activeResource}
                    fields={columns.map((column) => column.key)}
                  />
                </TabsContent>

                <TabsContent value="aggregation">
                  <AggregationBuilder connectionId={connectionId} connection={connection} resource={activeResource} />
                </TabsContent>

                <TabsContent value="schema">
                  <SchemaViewer connectionId={connectionId} resource={activeResource} />
                </TabsContent>

                <TabsContent value="indexes">
                  <IndexManager connectionId={connectionId} connection={connection} resource={activeResource} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

function MetricCard({
  label,
  value,
  hint
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="metric-tile p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
