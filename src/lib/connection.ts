import {
  ConnectionProfile,
  DatabaseType,
  PersistedConnectionProfile,
  ResolvedConnectionProfile
} from "@/types";
import { getSessionConnectionUri } from "@/lib/storage";

export function parseConnectionUri(uri: string) {
  try {
    const parsed = new URL(uri);

    return {
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : undefined,
      database: parsed.pathname.replace(/^\//, "") || undefined,
      username: parsed.username || undefined
    };
  } catch {
    return {
      host: undefined,
      port: undefined,
      database: undefined,
      username: undefined
    };
  }
}

export function redactConnectionUri(uri: string) {
  try {
    const parsed = new URL(uri);

    if (parsed.password) {
      parsed.password = "••••••";
    }

    if (parsed.username) {
      parsed.username = parsed.username.slice(0, 2) + "••";
    }

    return parsed.toString();
  } catch {
    return uri.replace(/:\/\/([^@]+)@/, "://••••@");
  }
}

export function toPersistedConnectionProfile(input: {
  id: string;
  name: string;
  type: DatabaseType;
  uri: string;
}): PersistedConnectionProfile {
  const parsed = parseConnectionUri(input.uri);

  return {
    id: input.id,
    name: input.name,
    type: input.type,
    redactedUri: redactConnectionUri(input.uri),
    host: parsed.host,
    port: parsed.port,
    database: parsed.database,
    username: parsed.username,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function resolveConnectionProfile(
  profile: PersistedConnectionProfile
): ResolvedConnectionProfile {
  return {
    ...profile,
    uri: getSessionConnectionUri(profile.id)
  };
}

export function isMongoConnection(connection?: ConnectionProfile | null) {
  return connection?.type === "mongodb";
}
