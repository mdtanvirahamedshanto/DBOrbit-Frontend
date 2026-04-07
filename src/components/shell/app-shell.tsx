"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Database, Orbit, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectionsList } from "@/features/connections/components/connections-list";
import { ConnectionFormDialog } from "@/features/connections/components/connection-form-dialog";
import { useConnections } from "@/features/connections/hooks/use-connections";
import { ExplorerTree } from "@/features/explorer/components/explorer-tree";
import { RecordsPanel } from "@/features/records/components/records-panel";
import { TopBar } from "@/components/shell/top-bar";
import { Footer } from "@/components/shell/footer";
import { useUiStore } from "@/store/ui-store";
import { useWorkspaceStore } from "@/store/workspace-store";

export function AppShell() {
  const queryClient = useQueryClient();
  const { profiles, activeConnection, activeProfileId, connectionId, openLiveConnection } =
    useConnections();
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const setConnectionDialogOpen = useUiStore((state) => state.setConnectionDialogOpen);
  const activeTab = useUiStore((state) => state.activeTab);
  const activeResource = useUiStore((state) => state.activeResource);
  const openRecordDialog = useUiStore((state) => state.openRecordDialog);
  const addRecentResource = useWorkspaceStore((state) => state.addRecentResource);

  useEffect(() => {
    if (!activeConnection && profiles.length > 0) {
      void openLiveConnection(profiles[0].id);
    }
  }, [activeConnection, openLiveConnection, profiles]);

  useEffect(() => {
    if (!activeProfileId || !activeConnection || !activeResource) {
      return;
    }

    addRecentResource({
      profileId: activeProfileId,
      profileName: activeConnection.name,
      resource: activeResource
    });
  }, [activeConnection, activeProfileId, activeResource, addRecentResource]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.getAttribute("contenteditable") === "true";

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setConnectionDialogOpen(true);
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "n") {
        event.preventDefault();
        if (useUiStore.getState().activeResource) {
          openRecordDialog();
        }
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setSidebarOpen(!sidebarOpen);
      }

      if (!isTyping && event.key === "/") {
        event.preventDefault();
        useUiStore.getState().setActiveTab("query");
        window.dispatchEvent(new Event("dborbit:focus-query-builder"));
      }

      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();

        if (activeTab === "query") {
          window.dispatchEvent(new Event("dborbit:run-query"));
        } else if (activeTab === "aggregation") {
          window.dispatchEvent(new Event("dborbit:run-aggregation"));
        } else {
          queryClient.invalidateQueries({ queryKey: ["records"] });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeTab,
    openRecordDialog,
    queryClient,
    setConnectionDialogOpen,
    setSidebarOpen,
    sidebarOpen
  ]);

  return (
    <>
      <ConnectionFormDialog />

      <main className="min-h-screen px-4 py-4 sm:px-6">
        <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1800px] gap-4">
          <aside
            className={`panel-surface panel-premium fixed inset-y-4 left-4 z-30 flex w-[332px] flex-col gap-5 overflow-hidden border border-border/80 px-4 py-4 shadow-panel transition lg:static lg:translate-x-0 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-[120%]"
            }`}
          >
            <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-primary/18 via-background/60 to-accent/10 px-4 py-4">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_34%)]" />
              <div className="relative flex items-center gap-3">
                <div className="rounded-2xl border border-primary/20 bg-primary/12 p-3 shadow-glow">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="glass-chip mb-2 w-fit">
                    <Orbit className="h-3.5 w-3.5 text-primary" />
                    Data Workstation
                  </div>
                  <p className="text-lg font-semibold">DBOrbit</p>
                  <p className="text-sm text-muted-foreground">
                    Premium multi-database operations cockpit
                  </p>
                </div>
              </div>
            </div>

            <ConnectionsList />
            <ExplorerTree connection={activeConnection} connectionId={connectionId} />
          </aside>

          {sidebarOpen ? (
            <button
              className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            />
          ) : null}

          <section className="flex min-w-0 flex-1 flex-col gap-4 lg:pl-0">
            <TopBar
              onRefresh={() => {
                queryClient.invalidateQueries();
              }}
            />

            {profiles.length === 0 ? (
              <Card className="panel-premium flex flex-1 items-center justify-center">
                <CardContent className="w-full max-w-2xl py-12">
                  <CardHeader className="border-b-0 p-0">
                    <div className="mb-5 inline-flex w-fit rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-primary">
                      Phase-ready workspace
                    </div>
                    <CardTitle className="flex items-center gap-3 text-3xl">
                      <Sparkles className="h-7 w-7 text-primary" />
                      Start with your first database profile
                    </CardTitle>
                    <CardDescription className="max-w-xl text-base leading-7">
                      This frontend is structured like a real SaaS workspace: connection
                      management, explorer tree, records tabs, query builder, aggregation,
                      schema intelligence, and index operations. Add a connection to bring the
                      UI to life immediately.
                    </CardDescription>
                  </CardHeader>
                </CardContent>
              </Card>
            ) : (
              <RecordsPanel connection={activeConnection} connectionId={connectionId} />
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
