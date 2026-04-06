import { apiClient, unwrapResponse } from "@/lib/api";
import {
  ColumnDefinition,
  DbRecord,
  FilterRule,
  RecordsQueryParams,
  RecordsResponse,
  ResourceTarget,
  SortState
} from "@/types";

interface RecordsInput {
  connectionId: string;
  resource: ResourceTarget;
  params: RecordsQueryParams;
}

interface BackendRecordsResponse {
  items: DbRecord[];
  total: number;
  page: number;
  limit: number;
}

function humanizeKey(key: string) {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (char) => char.toUpperCase());
}

function inferColumnType(value: unknown) {
  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    return "array";
  }

  if (typeof value === "object") {
    return "object";
  }

  return typeof value;
}

function buildColumns(items: DbRecord[]): ColumnDefinition[] {
  const keys = new Set<string>();

  for (const item of items) {
    for (const key of Object.keys(item)) {
      keys.add(key);
    }
  }

  return Array.from(keys).map((key) => {
    const sampleValue = items.find((item) => item[key] !== undefined)?.[key];

    return {
      key,
      label: humanizeKey(key),
      type: inferColumnType(sampleValue),
      editable: key !== "_id" && key !== "id",
      sortable: true
    };
  });
}

function parseValue(rawValue: string): unknown {
  const normalized = rawValue.trim();

  if (!normalized) {
    return "";
  }

  if (normalized === "null") {
    return null;
  }

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  if (!Number.isNaN(Number(normalized)) && normalized !== "") {
    return Number(normalized);
  }

  if (
    (normalized.startsWith("{") && normalized.endsWith("}")) ||
    (normalized.startsWith("[") && normalized.endsWith("]"))
  ) {
    try {
      return JSON.parse(normalized) as unknown;
    } catch {
      return normalized;
    }
  }

  return normalized;
}

function mapRulesToFilter(filters: FilterRule[]) {
  return filters.reduce<Record<string, unknown>>((result, filter) => {
    if (!filter.field.trim() || !filter.value.trim()) {
      return result;
    }

    const parsedValue = parseValue(filter.value);

    switch (filter.operator) {
      case "neq":
        result[filter.field] = { ne: parsedValue };
        break;
      case "contains":
        result[filter.field] = { like: `%${String(parsedValue)}%` };
        break;
      case "startsWith":
        result[filter.field] = { like: `${String(parsedValue)}%` };
        break;
      case "gt":
        result[filter.field] = { gt: parsedValue };
        break;
      case "lt":
        result[filter.field] = { lt: parsedValue };
        break;
      case "in":
        result[filter.field] = {
          in: String(filter.value)
            .split(",")
            .map((entry) => parseValue(entry))
            .filter((entry) => entry !== "")
        };
        break;
      default:
        result[filter.field] = parsedValue;
        break;
    }

    return result;
  }, {});
}

function mapSortingToSort(sorting: SortState[]) {
  return sorting.reduce<Record<string, "asc" | "desc">>((result, item) => {
    result[item.id] = item.desc ? "desc" : "asc";
    return result;
  }, {});
}

function buildRecordFilter(record: DbRecord) {
  if (record._id) {
    return { _id: record._id };
  }

  if (record.id !== undefined && record.id !== null) {
    return { id: record.id };
  }

  const primitiveEntries = Object.entries(record).filter(([, value]) => {
    return value === null || ["string", "number", "boolean"].includes(typeof value);
  });

  if (primitiveEntries.length === 0) {
    throw new Error("Unable to infer a safe row filter for this record.");
  }

  return Object.fromEntries(primitiveEntries);
}

function normalizeRecordsResponse(data: BackendRecordsResponse): RecordsResponse {
  return {
    columns: buildColumns(data.items),
    items: data.items,
    total: data.total,
    page: data.page,
    pageSize: data.limit
  };
}

export async function getRecords({
  connectionId,
  resource,
  params
}: RecordsInput): Promise<RecordsResponse> {
  const data = await unwrapResponse<BackendRecordsResponse>(
    apiClient.get(`/records/${connectionId}`, {
      params: {
        db: resource.database,
        collection: resource.schema ? `${resource.schema}.${resource.entity}` : resource.entity,
        limit: params.pageSize,
        page: params.page,
        sort:
          params.sorting.length > 0 ? JSON.stringify(mapSortingToSort(params.sorting)) : undefined,
        filter:
          params.filters.length > 0 ? JSON.stringify(mapRulesToFilter(params.filters)) : undefined
      }
    })
  );

  return normalizeRecordsResponse(data);
}

export async function createRecord(
  connectionId: string,
  resource: ResourceTarget,
  payload: DbRecord
) {
  return unwrapResponse(
    apiClient.post(`/insert/${connectionId}`, {
      db: resource.database,
      collection: resource.schema ? `${resource.schema}.${resource.entity}` : resource.entity,
      values: payload
    })
  );
}

export async function updateRecord(
  connectionId: string,
  resource: ResourceTarget,
  currentRecord: DbRecord,
  patch: DbRecord
) {
  return unwrapResponse(
    apiClient.put(`/update/${connectionId}`, {
      db: resource.database,
      collection: resource.schema ? `${resource.schema}.${resource.entity}` : resource.entity,
      filter: buildRecordFilter(currentRecord),
      data: patch
    })
  );
}

export async function deleteRecord(
  connectionId: string,
  resource: ResourceTarget,
  currentRecord: DbRecord
) {
  return unwrapResponse(
    apiClient.delete(`/delete/${connectionId}`, {
      data: {
        db: resource.database,
        collection: resource.schema ? `${resource.schema}.${resource.entity}` : resource.entity,
        filter: buildRecordFilter(currentRecord)
      }
    })
  );
}
