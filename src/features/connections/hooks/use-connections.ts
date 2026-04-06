"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import { useConnectionsStore } from "@/store/connections-store";
import { useUiStore } from "@/store/ui-store";
import { resolveConnectionProfile, toPersistedConnectionProfile } from "@/lib/connection";
import {
  getSessionConnectionUri,
  removeSessionConnectionUri,
  setSessionConnectionUri
} from "@/lib/storage";
import { DatabaseType } from "@/types";
import { useConnect, useDisconnect } from "@/features/connections/hooks/use-connect";

export function useConnections() {
  const profiles = useConnectionsStore((state) => state.profiles);
  const upsertProfile = useConnectionsStore((state) => state.upsertProfile);
  const removeProfile = useConnectionsStore((state) => state.removeProfile);
  const activeProfileId = useUiStore((state) => state.activeProfileId);
  const connectionId = useUiStore((state) => state.connectionId);
  const connectionStatus = useUiStore((state) => state.connectionStatus);
  const connectionError = useUiStore((state) => state.connectionError);
  const setActiveProfileId = useUiStore((state) => state.setActiveProfileId);
  const setConnectionState = useUiStore((state) => state.setConnectionState);
  const resetConnectionSelection = useUiStore((state) => state.resetConnectionSelection);

  const connectMutation = useConnect();
  const disconnectMutation = useDisconnect();

  const resolvedProfiles = useMemo(
    () =>
      profiles.map((profile) => ({
        ...resolveConnectionProfile(profile),
        hasLiveUri: Boolean(getSessionConnectionUri(profile.id))
      })),
    [profiles]
  );

  const activeConnection = resolvedProfiles.find((profile) => profile.id === activeProfileId);

  async function openLiveConnection(profileId: string) {
    const profile = resolvedProfiles.find((item) => item.id === profileId);

    if (!profile) {
      return;
    }

    const uri = getSessionConnectionUri(profile.id);

    if (!uri) {
      setConnectionState({
        profileId,
        status: "error",
        errorMessage: "Connection URI is no longer available in this browser session."
      });
      toast.error("Reconnect with the full URI to restore this profile.");
      return;
    }

    setActiveProfileId(profileId);
    setConnectionState({
      profileId,
      status: "connecting"
    });

    try {
      const result = await connectMutation.mutateAsync({
        type: profile.type,
        uri
      });

      setConnectionState({
        profileId,
        connectionId: result.connectionId,
        connectionType: result.type,
        status: "connected"
      });
    } catch (error) {
      setConnectionState({
        profileId,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Connection failed"
      });
      throw error;
    }
  }

  async function saveConnection(input: { name: string; type: DatabaseType; uri: string }) {
    const result = await connectMutation.mutateAsync({
      type: input.type,
      uri: input.uri
    });
    const id = crypto.randomUUID();
    const profile = toPersistedConnectionProfile({
      id,
      name: input.name,
      type: input.type,
      uri: input.uri
    });

    setSessionConnectionUri(id, input.uri);
    upsertProfile(profile);
    setActiveProfileId(id);
    setConnectionState({
      profileId: id,
      connectionId: result.connectionId,
      connectionType: result.type,
      status: "connected"
    });

    return result;
  }

  async function deleteConnection(profileId: string) {
    const isActiveProfile = profileId === activeProfileId;

    if (isActiveProfile && connectionId) {
      try {
        await disconnectMutation.mutateAsync(connectionId);
      } catch {
        // The backend may already have cleaned up the connection.
      }
    }

    removeSessionConnectionUri(profileId);
    removeProfile(profileId);

    if (isActiveProfile) {
      const nextProfile = resolvedProfiles.find((profile) => profile.id !== profileId);

      if (nextProfile) {
        resetConnectionSelection();
        await openLiveConnection(nextProfile.id);
        return;
      }

      setActiveProfileId(undefined);
      resetConnectionSelection();
    }
  }

  return {
    profiles: resolvedProfiles,
    activeConnection,
    activeProfileId,
    connectionId,
    connectionStatus,
    connectionError,
    isConnecting:
      connectionStatus === "connecting" || connectMutation.isPending || disconnectMutation.isPending,
    openLiveConnection,
    saveConnection,
    deleteConnection
  };
}
