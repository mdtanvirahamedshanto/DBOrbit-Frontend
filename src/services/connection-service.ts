import { apiClient, unwrapResponse } from "@/lib/api";
import { ConnectResult, DatabaseType } from "@/types";

export async function connectToDatabase(input: {
  type: DatabaseType;
  uri: string;
}) {
  return unwrapResponse<ConnectResult>(
    apiClient.post("/connect", {
      type: input.type,
      uri: input.uri
    })
  );
}

export async function disconnectFromDatabase(connectionId: string) {
  return unwrapResponse<{ connectionId: string; disconnected: boolean }>(
    apiClient.delete(`/connect/${connectionId}`)
  );
}
