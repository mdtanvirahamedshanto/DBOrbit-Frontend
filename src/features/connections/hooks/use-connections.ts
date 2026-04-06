"use client";

import { useMemo } from "react";
import { useConnectionsStore } from "@/store/connections-store";
import { useUiStore } from "@/store/ui-store";
import { resolveConnectionProfile, toPersistedConnectionProfile } from "@/lib/connection";
import {
  getSessionConnectionUri,
  removeSessionConnectionUri,
  setSessionConnectionUri
} from "@/lib/storage";
import { DatabaseType } from "@/types";

export function useConnections() {
  const profiles = useConnectionsStore((state) => state.profiles);
  const upsertProfile = useConnectionsStore((state) => state.upsertProfile);
  const removeProfile = useConnectionsStore((state) => state.removeProfile);
  const activeConnectionId = useUiStore((state) => state.activeConnectionId);
  const setActiveConnectionId = useUiStore((state) => state.setActiveConnectionId);

  const resolvedProfiles = useMemo(
    () =>
      profiles.map((profile) => ({
        ...resolveConnectionProfile(profile),
        hasLiveUri: Boolean(getSessionConnectionUri(profile.id))
      })),
    [profiles]
  );

  const activeConnection = resolvedProfiles.find(
    (profile) => profile.id === activeConnectionId
  );

  function saveConnection(input: { name: string; type: DatabaseType; uri: string }) {
    const id = crypto.randomUUID();
    const profile = toPersistedConnectionProfile({
      id,
      name: input.name,
      type: input.type,
      uri: input.uri
    });

    setSessionConnectionUri(id, input.uri);
    upsertProfile(profile);
    setActiveConnectionId(id);
  }

  function deleteConnection(profileId: string) {
    removeSessionConnectionUri(profileId);
    removeProfile(profileId);

    if (profileId === activeConnectionId) {
      const next = resolvedProfiles.find((profile) => profile.id !== profileId);
      setActiveConnectionId(next?.id);
    }
  }

  return {
    profiles: resolvedProfiles,
    activeConnection,
    activeConnectionId,
    setActiveConnectionId,
    saveConnection,
    deleteConnection
  };
}
