import { apiClient, unwrapResponse } from "@/lib/api";

export async function getDatabases(connectionId: string) {
  return unwrapResponse<string[]>(apiClient.get(`/databases/${connectionId}`));
}

export async function getCollections(connectionId: string, db: string) {
  return unwrapResponse<string[]>(
    apiClient.get(`/collections/${connectionId}`, {
      params: { db }
    })
  );
}
