import { apiClient, unwrapResponse } from "@/lib/api";
import {
  ConnectionProfile,
  DbRecord,
  FilterRule,
  QueryExecutionResult,
  ResourceTarget
} from "@/types";

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

  if (!Number.isNaN(Number(normalized))) {
    return Number(normalized);
  }

  try {
    return JSON.parse(normalized) as unknown;
  } catch {
    return normalized;
  }
}

function rulesToFilter(filters: FilterRule[]) {
  return filters.reduce<Record<string, unknown>>((result, rule) => {
    if (!rule.field.trim() || !rule.value.trim()) {
      return result;
    }

    const parsedValue = parseValue(rule.value);

    switch (rule.operator) {
      case "neq":
        result[rule.field] = { ne: parsedValue };
        break;
      case "contains":
        result[rule.field] = { like: `%${String(parsedValue)}%` };
        break;
      case "startsWith":
        result[rule.field] = { like: `${String(parsedValue)}%` };
        break;
      case "gt":
        result[rule.field] = { gt: parsedValue };
        break;
      case "lt":
        result[rule.field] = { lt: parsedValue };
        break;
      case "in":
        result[rule.field] = {
          in: String(rule.value)
            .split(",")
            .map((entry) => parseValue(entry))
            .filter((entry) => entry !== "")
        };
        break;
      default:
        result[rule.field] = parsedValue;
        break;
    }

    return result;
  }, {});
}

function formatVisualQuery(
  connection: ConnectionProfile,
  resource: ResourceTarget,
  filters: FilterRule[]
) {
  if (connection.type === "mongodb") {
    return `db.${resource.entity}.find(${JSON.stringify(rulesToFilter(filters), null, 2)})`;
  }

  if (filters.length === 0) {
    return `SELECT * FROM ${resource.schema ? `${resource.schema}.` : ""}${resource.entity};`;
  }

  const clauses = filters
    .filter((rule) => rule.field && rule.value)
    .map((rule) => `${rule.field} ${rule.operator} ${rule.value}`);

  return `SELECT * FROM ${resource.schema ? `${resource.schema}.` : ""}${resource.entity}
WHERE ${clauses.join(" AND ")};`;
}

export async function executeQuery(input: {
  connectionId: string;
  connection: ConnectionProfile;
  resource: ResourceTarget;
  filters: FilterRule[];
  advancedQuery?: string;
}): Promise<QueryExecutionResult> {
  const { connectionId, connection, resource, filters, advancedQuery } = input;

  if (advancedQuery?.trim()) {
    if (connection.type === "mongodb") {
      const filter = JSON.parse(advancedQuery) as Record<string, unknown>;
      const data = await unwrapResponse<{
        items: DbRecord[];
        total: number;
      }>(
        apiClient.post(`/query/${connectionId}`, {
          operation: "find",
          db: resource.database,
          collection: resource.schema ? `${resource.schema}.${resource.entity}` : resource.entity,
          page: 1,
          limit: 100,
          filter
        })
      );

      return {
        preview: data.items,
        total: data.total,
        generatedQuery: advancedQuery
      };
    }

    const data = await unwrapResponse<{
      rows: DbRecord[];
      rowCount: number;
    }>(
      apiClient.post(`/query/${connectionId}/raw`, {
        db: resource.database,
        statement: advancedQuery
      })
    );

    return {
      preview: data.rows,
      total: data.rowCount,
      generatedQuery: advancedQuery
    };
  }

  const data = await unwrapResponse<{
    items: DbRecord[];
    total: number;
  }>(
    apiClient.post(`/query/${connectionId}`, {
      operation: "find",
      db: resource.database,
      collection: resource.schema ? `${resource.schema}.${resource.entity}` : resource.entity,
      page: 1,
      limit: 100,
      filter: rulesToFilter(filters)
    })
  );

  return {
    preview: data.items,
    total: data.total,
    generatedQuery: formatVisualQuery(connection, resource, filters)
  };
}
