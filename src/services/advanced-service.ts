import { apiClient } from "@/lib/api";
import {
  AggregationStage,
  ConnectionProfile,
  IndexDefinition,
  ResourceTarget,
  SchemaFieldStat
} from "@/types";
import { getConnectionPayload } from "@/services/connection-service";
import {
  createMockIndex,
  deleteMockIndex,
  getMockIndexes,
  getMockSchema,
  runMockAggregation
} from "@/services/mock-data";

export async function getSchema(
  connection: ConnectionProfile,
  resource: ResourceTarget
): Promise<SchemaFieldStat[]> {
  try {
    const { data } = await apiClient.post("/schema/describe", {
      ...getConnectionPayload(connection),
      resource
    });

    return data.fields as SchemaFieldStat[];
  } catch {
    return getMockSchema(connection, resource);
  }
}

export async function getIndexes(
  connection: ConnectionProfile,
  resource: ResourceTarget
): Promise<IndexDefinition[]> {
  try {
    const { data } = await apiClient.post("/indexes/list", {
      ...getConnectionPayload(connection),
      resource
    });

    return data.indexes as IndexDefinition[];
  } catch {
    return getMockIndexes(connection, resource);
  }
}

export async function createIndex(
  connection: ConnectionProfile,
  resource: ResourceTarget,
  payload: Omit<IndexDefinition, "id">
) {
  try {
    const { data } = await apiClient.post("/indexes/create", {
      ...getConnectionPayload(connection),
      resource,
      payload
    });

    return data;
  } catch {
    return createMockIndex(connection, resource, payload);
  }
}

export async function deleteIndex(
  connection: ConnectionProfile,
  resource: ResourceTarget,
  indexId: string
) {
  try {
    const { data } = await apiClient.post("/indexes/delete", {
      ...getConnectionPayload(connection),
      resource,
      indexId
    });

    return data;
  } catch {
    return deleteMockIndex(connection, resource, indexId);
  }
}

export async function runAggregation(
  connection: ConnectionProfile,
  resource: ResourceTarget,
  stages: AggregationStage[]
) {
  try {
    const { data } = await apiClient.post("/aggregation/run", {
      ...getConnectionPayload(connection),
      resource,
      stages
    });

    return data.items as Record<string, unknown>[];
  } catch {
    return runMockAggregation(connection, resource, stages);
  }
}
