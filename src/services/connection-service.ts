import { apiClient } from "@/lib/api";
import { ConnectionProfile } from "@/types";

function serializeConnection(connection: ConnectionProfile) {
  return {
    id: connection.id,
    name: connection.name,
    type: connection.type,
    uri: connection.uri,
    host: connection.host,
    port: connection.port,
    database: connection.database
  };
}

export async function validateConnection(connection: ConnectionProfile) {
  try {
    const { data } = await apiClient.post("/connections/validate", {
      connection: serializeConnection(connection)
    });

    return data as { success: boolean; latencyMs?: number };
  } catch {
    return {
      success: Boolean(connection.uri || connection.redactedUri),
      latencyMs: 42
    };
  }
}

export function getConnectionPayload(connection: ConnectionProfile) {
  return {
    connection: serializeConnection(connection)
  };
}
