import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ResourceTarget } from "@/types";

export interface WorkspaceBookmark {
  profileId: string;
  profileName?: string;
  resource: ResourceTarget;
  savedAt: string;
}

interface WorkspaceStoreState {
  pinnedResources: WorkspaceBookmark[];
  recentResources: WorkspaceBookmark[];
  togglePinnedResource: (bookmark: Omit<WorkspaceBookmark, "savedAt">) => void;
  addRecentResource: (bookmark: Omit<WorkspaceBookmark, "savedAt">) => void;
}

function isSameBookmark(
  left: Pick<WorkspaceBookmark, "profileId" | "resource">,
  right: Pick<WorkspaceBookmark, "profileId" | "resource">
) {
  return (
    left.profileId === right.profileId &&
    left.resource.resourceId === right.resource.resourceId &&
    left.resource.database === right.resource.database
  );
}

export const useWorkspaceStore = create<WorkspaceStoreState>()(
  persist(
    (set) => ({
      pinnedResources: [],
      recentResources: [],
      togglePinnedResource: (bookmark) =>
        set((state) => {
          const existing = state.pinnedResources.find((item) => isSameBookmark(item, bookmark));

          if (existing) {
            return {
              pinnedResources: state.pinnedResources.filter(
                (item) => !isSameBookmark(item, bookmark)
              )
            };
          }

          return {
            pinnedResources: [
              {
                ...bookmark,
                savedAt: new Date().toISOString()
              },
              ...state.pinnedResources
            ]
          };
        }),
      addRecentResource: (bookmark) =>
        set((state) => {
          const next = [
            {
              ...bookmark,
              savedAt: new Date().toISOString()
            },
            ...state.recentResources.filter((item) => !isSameBookmark(item, bookmark))
          ];

          return {
            recentResources: next.slice(0, 8)
          };
        })
    }),
    {
      name: "dborbit.workspace",
      partialize: (state) => ({
        pinnedResources: state.pinnedResources,
        recentResources: state.recentResources
      })
    }
  )
);
