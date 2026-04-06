import { create } from "zustand";
import { ResourceTarget, WorkspaceTab } from "@/types";

interface UiStoreState {
  activeConnectionId?: string;
  activeResource?: ResourceTarget;
  activeTab: WorkspaceTab;
  sidebarOpen: boolean;
  connectionDialogOpen: boolean;
  recordDialogOpen: boolean;
  selectedRecord?: Record<string, unknown>;
  setActiveConnectionId: (id?: string) => void;
  setActiveResource: (resource?: ResourceTarget) => void;
  setActiveTab: (tab: WorkspaceTab) => void;
  setSidebarOpen: (open: boolean) => void;
  setConnectionDialogOpen: (open: boolean) => void;
  openRecordDialog: (record?: Record<string, unknown>) => void;
  closeRecordDialog: () => void;
}

export const useUiStore = create<UiStoreState>((set) => ({
  activeConnectionId: undefined,
  activeResource: undefined,
  activeTab: "records",
  sidebarOpen: true,
  connectionDialogOpen: false,
  recordDialogOpen: false,
  selectedRecord: undefined,
  setActiveConnectionId: (id) =>
    set({
      activeConnectionId: id,
      activeResource: undefined
    }),
  setActiveResource: (resource) => set({ activeResource: resource }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setConnectionDialogOpen: (open) => set({ connectionDialogOpen: open }),
  openRecordDialog: (record) =>
    set({ recordDialogOpen: true, selectedRecord: record }),
  closeRecordDialog: () =>
    set({ recordDialogOpen: false, selectedRecord: undefined })
}));
