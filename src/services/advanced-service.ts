import { apiClient, unwrapResponse } from "@/lib/api";
import {
  AggregationStage,
  IndexDefinition,
  ResourceTarget,
  SchemaFieldStat
} from "@/types";

function getCollectionName(resource: ResourceTarget) {
  return resource.schema ? `${resource.schema}.${resource.entity}` : resource.entity;
}

function mapSchemaField(field: Record<string, unknown>): SchemaFieldStat {
  if ("path" in field) {
    return {
      field: String(field.path),
      type: Array.isArray(field.types) ? field.types.join(", ") : "unknown",
      nullable: Boolean(field.nullable),
      observedCount: Number(field.sampleCount ?? 0),
      details: `Observed in ${field.sampleCount ?? 0} sampled documents`
    };
  }

  const columnName = String(field.columnName ?? field.column_name ?? "");
  const dataType = String(field.columnType ?? field.data_type ?? field.udt_name ?? "unknown");
  const nullable =
    String(field.isNullable ?? field.is_nullable ?? "NO").toUpperCase() === "YES";
  const details = [
    field.columnDefault ?? field.column_default
      ? `Default: ${String(field.columnDefault ?? field.column_default)}`
      : null,
    field.columnKey ? `Key: ${String(field.columnKey)}` : null,
    field.extra ? `Extra: ${String(field.extra)}` : null
  ]
    .filter(Boolean)
    .join(" • ");

  return {
    field: columnName,
    type: dataType,
    nullable,
    details: details || "Column metadata"
  };
}

function mapIndex(index: Record<string, unknown>): IndexDefinition {
  if ("key" in index && typeof index.key === "object" && index.key) {
    return {
      id: String(index.name ?? index.v ?? crypto.randomUUID()),
      name: String(index.name ?? "unnamed_index"),
      keys: Object.entries(index.key as Record<string, unknown>).map(
        ([key, direction]) => `${key} (${direction})`
      ),
      unique: Boolean(index.unique),
      sparse: Boolean(index.sparse),
      type: "mongodb"
    };
  }

  if ("columns" in index && Array.isArray(index.columns)) {
    return {
      id: String(index.name ?? crypto.randomUUID()),
      name: String(index.name ?? "unnamed_index"),
      keys: (index.columns as string[]).map(String),
      unique: Boolean(index.unique),
      type: String(index.type ?? "btree")
    };
  }

  return {
    id: String(index.name ?? crypto.randomUUID()),
    name: String(index.name ?? "unnamed_index"),
    keys: [String(index.definition ?? "definition unavailable")],
    definition: String(index.definition ?? ""),
    type: "postgres"
  };
}

export async function getSchema(connectionId: string, resource: ResourceTarget) {
  const data = await unwrapResponse<Record<string, unknown>[]>(
    apiClient.get(`/schema/${connectionId}`, {
      params: {
        db: resource.database,
        collection: getCollectionName(resource)
      }
    })
  );

  return data.map(mapSchemaField);
}

export async function getIndexes(connectionId: string, resource: ResourceTarget) {
  const data = await unwrapResponse<Record<string, unknown>[]>(
    apiClient.get(`/indexes/${connectionId}`, {
      params: {
        db: resource.database,
        collection: getCollectionName(resource)
      }
    })
  );

  return data.map(mapIndex);
}

export async function createIndex(
  connectionId: string,
  resource: ResourceTarget,
  payload: Omit<IndexDefinition, "id">
) {
  const columns =
    payload.type === "mongodb"
      ? payload.keys.reduce<Record<string, 1>>((result, key) => {
          const normalizedKey = key.replace(/\s+\(.+\)$/, "");
          result[normalizedKey] = 1;
          return result;
        }, {})
      : payload.keys.map((key) => key.replace(/\s+\(.+\)$/, ""));

  return unwrapResponse(
    apiClient.post(`/indexes/${connectionId}`, {
      db: resource.database,
      collection: getCollectionName(resource),
      name: payload.name,
      columns,
      unique: payload.unique
    })
  );
}

export async function deleteIndex(
  connectionId: string,
  resource: ResourceTarget,
  indexName: string
) {
  return unwrapResponse(
    apiClient.delete(`/indexes/${connectionId}`, {
      data: {
        db: resource.database,
        collection: getCollectionName(resource),
        name: indexName
      }
    })
  );
}

export async function runAggregation(
  connectionId: string,
  resource: ResourceTarget,
  stages: AggregationStage[]
) {
  return unwrapResponse<Record<string, unknown>[]>(
    apiClient.post(`/query/${connectionId}`, {
      operation: "aggregate",
      db: resource.database,
      collection: getCollectionName(resource),
      pipeline: stages.map((stage) => ({
        [stage.stage]: JSON.parse(stage.value)
      }))
    })
  );
}
