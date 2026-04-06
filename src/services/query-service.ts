import { apiClient } from "@/lib/api";
import {
  ConnectionProfile,
  FilterRule,
  QueryExecutionResult,
  ResourceTarget
} from "@/types";
import { getConnectionPayload } from "@/services/connection-service";
import { runMockQuery } from "@/services/mock-data";

export async function executeQuery(input: {
  connection: ConnectionProfile;
  resource: ResourceTarget;
  filters: FilterRule[];
  advancedQuery?: string;
}): Promise<QueryExecutionResult> {
  const { connection, resource, filters, advancedQuery } = input;

  try {
    const { data } = await apiClient.post("/query/run", {
      ...getConnectionPayload(connection),
      resource,
      filters,
      advancedQuery
    });

    return data as QueryExecutionResult;
  } catch {
    return runMockQuery(connection, resource, filters, advancedQuery);
  }
}
