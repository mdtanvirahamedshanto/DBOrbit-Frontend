import { create } from "zustand";
import { DatabaseType, ResourceTarget, WorkspaceTab } from "@/types";

interface UiStoreState {
  activeProfileId?: string;
  connectionId?: string;
  connectionType?: DatabaseType;
  connectionStatus: "idle" | "connecting" | "connected" | "error";
  connectionError?: string;
  selectedDatabase?: string;
  selectedCollection?: string;
  activeResource?: ResourceTarget;
  activeTab: WorkspaceTab;
  sidebarOpen: boolean;
  connectionDialogOpen: boolean;
  recordDialogOpen: boolean;
  selectedRecord?: Record<string, unknown>;
  setActiveProfileId: (profileId?: string) => void;
  setConnectionState: (input: {
    profileId?: string;
    connectionId?: string;
    connectionType?: DatabaseType;
    status: UiStoreState["connectionStatus"];
    errorMessage?: string;
  }) => void;
  setSelectedDatabase: (database?: string) => void;
  setActiveResource: (resource?: ResourceTarget) => void;
  setActiveTab: (tab: WorkspaceTab) => void;
  setSidebarOpen: (open: boolean) => void;
  setConnectionDialogOpen: (open: boolean) => void;
  openRecordDialog: (record?: Record<string, unknown>) => void;
  closeRecordDialog: () => void;
  resetConnectionSelection: () => void;
}

export const useUiStore = create<UiStoreState>((set) => ({
  activeProfileId: undefined,
  connectionId: undefined,
  connectionType: undefined,
  connectionStatus: "idle",
  connectionError: undefined,
  selectedDatabase: undefined,
  selectedCollection: undefined,
  activeResource: undefined,
  activeTab: "records",
  sidebarOpen: true,
  connectionDialogOpen: false,
  recordDialogOpen: false,
  selectedRecord: undefined,
  setActiveProfileId: (profileId) =>
    set((state) => ({
      activeProfileId: profileId,
      connectionId: state.activeProfileId === profileId ? state.connectionId : undefined,
      connectionType: state.activeProfileId === profileId ? state.connectionType : undefined,
      connectionStatus: profileId ? "idle" : "idle",
      connectionError: undefined,
      selectedDatabase: undefined,
      selectedCollection: undefined,
      activeResource: undefined,
      activeTab: "records"
    })),
  setConnectionState: ({ profileId, connectionId, connectionType, status, errorMessage }) =>
    set((state) => ({
      activeProfileId: profileId ?? state.activeProfileId,
      connectionId,
      connectionType,
      connectionStatus: status,
      connectionError: errorMessage,
      activeResource: status === "connected" ? state.activeResource : undefined,
      selectedDatabase: status === "connected" ? state.selectedDatabase : undefined,
      selectedCollection: status === "connected" ? state.selectedCollection : undefined
    })),
  setSelectedDatabase: (database) =>
    set({
      selectedDatabase: database,
      selectedCollection: undefined,
      activeResource: undefined,
      activeTab: "records"
    }),
  setActiveResource: (resource) =>
    set({
      activeResource: resource,
      selectedDatabase: resource?.database,
      selectedCollection: resource?.entity,
      activeTab: "records"
    }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setConnectionDialogOpen: (open) => set({ connectionDialogOpen: open }),
  openRecordDialog: (record) =>
    set({ recordDialogOpen: true, selectedRecord: record }),
  closeRecordDialog: () =>
    set({ recordDialogOpen: false, selectedRecord: undefined }),
  resetConnectionSelection: () =>
    set({
      connectionId: undefined,
      connectionType: undefined,
      connectionStatus: "idle",
      connectionError: undefined,
      selectedDatabase: undefined,
      selectedCollection: undefined,
      activeResource: undefined,
      activeTab: "records"
    })
}));
