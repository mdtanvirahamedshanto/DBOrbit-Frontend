import { apiClient } from "@/lib/api";
import {
  ConnectionProfile,
  DbRecord,
  RecordsQueryParams,
  RecordsResponse,
  ResourceTarget
} from "@/types";
import { getConnectionPayload } from "@/services/connection-service";
import {
  createMockRecord,
  deleteMockRecord,
  getMockRecords,
  updateMockRecord
} from "@/services/mock-data";

interface RecordsInput {
  connection: ConnectionProfile;
  resource: ResourceTarget;
  params: RecordsQueryParams;
}

export async function getRecords({
  connection,
  resource,
  params
}: RecordsInput): Promise<RecordsResponse> {
  try {
    const { data } = await apiClient.post("/records/list", {
      ...getConnectionPayload(connection),
      resource,
      params
    });

    return data as RecordsResponse;
  } catch {
    return getMockRecords(connection, resource, params);
  }
}

export async function createRecord(
  connection: ConnectionProfile,
  resource: ResourceTarget,
  payload: DbRecord
) {
  try {
    const { data } = await apiClient.post("/records/create", {
      ...getConnectionPayload(connection),
      resource,
      payload
    });

    return data;
  } catch {
    return createMockRecord(connection, resource, payload);
  }
}

export async function updateRecord(
  connection: ConnectionProfile,
  resource: ResourceTarget,
  recordId: string,
  patch: DbRecord
) {
  try {
    const { data } = await apiClient.post("/records/update", {
      ...getConnectionPayload(connection),
      resource,
      recordId,
      patch
    });

    return data;
  } catch {
    return updateMockRecord(connection, resource, recordId, patch);
  }
}

export async function deleteRecord(
  connection: ConnectionProfile,
  resource: ResourceTarget,
  recordId: string
) {
  try {
    const { data } = await apiClient.post("/records/delete", {
      ...getConnectionPayload(connection),
      resource,
      recordId
    });

    return data;
  } catch {
    return deleteMockRecord(connection, resource, recordId);
  }
}
