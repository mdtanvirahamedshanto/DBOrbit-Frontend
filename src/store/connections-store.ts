import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PersistedConnectionProfile } from "@/types";

interface ConnectionsStoreState {
  profiles: PersistedConnectionProfile[];
  upsertProfile: (profile: PersistedConnectionProfile) => void;
  removeProfile: (profileId: string) => void;
}

export const useConnectionsStore = create<ConnectionsStoreState>()(
  persist(
    (set) => ({
      profiles: [],
      upsertProfile: (profile) =>
        set((state) => {
          const existing = state.profiles.find((item) => item.id === profile.id);

          if (!existing) {
            return {
              profiles: [profile, ...state.profiles]
            };
          }

          return {
            profiles: state.profiles.map((item) =>
              item.id === profile.id ? { ...item, ...profile } : item
            )
          };
        }),
      removeProfile: (profileId) =>
        set((state) => ({
          profiles: state.profiles.filter((item) => item.id !== profileId)
        }))
    }),
    {
      name: "dborbit.connections",
      partialize: (state) => ({
        profiles: state.profiles
      })
    }
  )
);
