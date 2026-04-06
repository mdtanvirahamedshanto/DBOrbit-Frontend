import { apiClient } from "@/lib/api";
import { ConnectionProfile, ExplorerNode } from "@/types";
import { getConnectionPayload } from "@/services/connection-service";
import { getMockExplorerTree } from "@/services/mock-data";

export async function getExplorerTree(connection: ConnectionProfile): Promise<ExplorerNode[]> {
  try {
    const { data } = await apiClient.post("/explorer/tree", getConnectionPayload(connection));
    return data.nodes as ExplorerNode[];
  } catch {
    return getMockExplorerTree(connection);
  }
}
