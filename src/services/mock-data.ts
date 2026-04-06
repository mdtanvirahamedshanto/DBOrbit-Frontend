import {
  AggregationStage,
  ColumnDefinition,
  ConnectionProfile,
  DbRecord,
  ExplorerNode,
  FilterRule,
  IndexDefinition,
  QueryExecutionResult,
  RecordsQueryParams,
  RecordsResponse,
  ResourceTarget,
  SchemaFieldStat
} from "@/types";

interface MockResourceState {
  target: ResourceTarget;
  columns: ColumnDefinition[];
  items: DbRecord[];
  indexes: IndexDefinition[];
}

interface MockWorkspace {
  tree: ExplorerNode[];
  resources: Record<string, MockResourceState>;
}

const mockWorkspaces = new Map<string, MockWorkspace>();

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 12);
}

function inferSchema(items: DbRecord[]): SchemaFieldStat[] {
  const counts = new Map<
    string,
    { type: string; frequency: number; nullable: boolean; sample?: string }
  >();

  for (const item of items) {
    for (const [field, value] of Object.entries(item)) {
      const current = counts.get(field);
      const nextType = Array.isArray(value)
        ? "array"
        : value === null
          ? "null"
          : typeof value;

      counts.set(field, {
        type:
          current?.type && current.type !== nextType ? "mixed" : current?.type ?? nextType,
        frequency: (current?.frequency ?? 0) + 1,
        nullable: current?.nullable ?? value === null,
        sample: current?.sample ?? stringifyValue(value)
      });
    }
  }

  return [...counts.entries()].map(([field, stat]) => ({
    field,
    type: stat.type,
    frequency: stat.frequency,
    nullable: stat.nullable,
    sample: stat.sample
  }));
}

function stringifyValue(value: unknown) {
  if (value === null || value === undefined) {
    return "null";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function getFieldValue(record: DbRecord, field: string) {
  return field
    .split(".")
    .reduce<unknown>((current, part) => {
      if (current && typeof current === "object" && part in current) {
        return (current as Record<string, unknown>)[part];
      }

      return undefined;
    }, record);
}

function applyFilters(items: DbRecord[], params: Pick<RecordsQueryParams, "filters" | "search">) {
  const search = params.search.trim().toLowerCase();

  return items.filter((item) => {
    const matchesSearch =
      !search ||
      Object.values(item).some((value) => stringifyValue(value).toLowerCase().includes(search));

    const matchesFilters = params.filters.every((filter) => {
      if (!filter.field) {
        return true;
      }

      const candidate = stringifyValue(getFieldValue(item, filter.field) ?? "").toLowerCase();
      const comparisonValue = filter.value.toLowerCase();

      switch (filter.operator) {
        case "eq":
          return candidate === comparisonValue;
        case "neq":
          return candidate !== comparisonValue;
        case "contains":
          return candidate.includes(comparisonValue);
        case "startsWith":
          return candidate.startsWith(comparisonValue);
        case "gt":
          return Number(candidate) > Number(filter.value);
        case "lt":
          return Number(candidate) < Number(filter.value);
        case "in":
          return filter.value
            .split(",")
            .map((part) => part.trim().toLowerCase())
            .includes(candidate);
        default:
          return true;
      }
    });

    return matchesSearch && matchesFilters;
  });
}

function applySorting(items: DbRecord[], sorting: RecordsQueryParams["sorting"]) {
  if (!sorting.length) {
    return items;
  }

  return [...items].sort((left, right) => {
    for (const sort of sorting) {
      const leftValue = stringifyValue(left[sort.id] ?? "");
      const rightValue = stringifyValue(right[sort.id] ?? "");

      if (leftValue === rightValue) {
        continue;
      }

      const result = leftValue > rightValue ? 1 : -1;
      return sort.desc ? -result : result;
    }

    return 0;
  });
}

function getRecordId(record: DbRecord) {
  const candidate = record.id ?? record._id;
  return typeof candidate === "string" || typeof candidate === "number"
    ? String(candidate)
    : stringifyValue(candidate);
}

function baseMongoWorkspace(): MockWorkspace {
  const usersTarget: ResourceTarget = {
    database: "analytics",
    entity: "users",
    kind: "collection",
    resourceId: "analytics.users"
  };

  const eventsTarget: ResourceTarget = {
    database: "analytics",
    entity: "events",
    kind: "collection",
    resourceId: "analytics.events"
  };

  const users: DbRecord[] = [
    {
      _id: "usr_001",
      name: "Ava Thompson",
      email: "ava@northstar.io",
      plan: "pro",
      active: true,
      signInCount: 18,
      createdAt: "2026-03-28T10:30:00Z"
    },
    {
      _id: "usr_002",
      name: "Noah Patel",
      email: "noah@northstar.io",
      plan: "team",
      active: true,
      signInCount: 34,
      createdAt: "2026-03-29T14:10:00Z"
    },
    {
      _id: "usr_003",
      name: "Sofia Kim",
      email: "sofia@northstar.io",
      plan: "starter",
      active: false,
      signInCount: 6,
      createdAt: "2026-04-01T09:15:00Z"
    }
  ];

  const events: DbRecord[] = [
    {
      _id: "evt_901",
      type: "login",
      source: "web",
      severity: "info",
      processed: true,
      createdAt: "2026-04-05T08:00:00Z"
    },
    {
      _id: "evt_902",
      type: "billing_failed",
      source: "worker",
      severity: "warning",
      processed: false,
      createdAt: "2026-04-05T11:16:00Z"
    },
    {
      _id: "evt_903",
      type: "export_ready",
      source: "scheduler",
      severity: "info",
      processed: true,
      createdAt: "2026-04-05T17:44:00Z"
    }
  ];

  return {
    tree: [
      {
        id: "analytics",
        name: "analytics",
        kind: "database",
        path: ["analytics"],
        children: [
          {
            id: "analytics.users",
            name: "users",
            kind: "collection",
            path: ["analytics", "users"],
            resourceId: "analytics.users",
            stats: { count: users.length }
          },
          {
            id: "analytics.events",
            name: "events",
            kind: "collection",
            path: ["analytics", "events"],
            resourceId: "analytics.events",
            stats: { count: events.length }
          }
        ]
      }
    ],
    resources: {
      [usersTarget.resourceId]: {
        target: usersTarget,
        columns: [
          { key: "_id", label: "_id", type: "ObjectId", editable: false, sortable: true },
          { key: "name", label: "name", type: "string", editable: true, sortable: true },
          { key: "email", label: "email", type: "string", editable: true, sortable: true },
          { key: "plan", label: "plan", type: "string", editable: true, sortable: true },
          { key: "active", label: "active", type: "boolean", editable: true, sortable: true },
          {
            key: "signInCount",
            label: "signInCount",
            type: "number",
            editable: true,
            sortable: true
          },
          {
            key: "createdAt",
            label: "createdAt",
            type: "date",
            editable: false,
            sortable: true
          }
        ],
        items: users,
        indexes: [
          { id: "users_email", name: "users_email", keys: ["email"], unique: true, type: "btree" },
          {
            id: "users_plan_active",
            name: "users_plan_active",
            keys: ["plan", "active"],
            type: "compound"
          }
        ]
      },
      [eventsTarget.resourceId]: {
        target: eventsTarget,
        columns: [
          { key: "_id", label: "_id", type: "ObjectId", editable: false, sortable: true },
          { key: "type", label: "type", type: "string", editable: true, sortable: true },
          { key: "source", label: "source", type: "string", editable: true, sortable: true },
          { key: "severity", label: "severity", type: "string", editable: true, sortable: true },
          {
            key: "processed",
            label: "processed",
            type: "boolean",
            editable: true,
            sortable: true
          },
          {
            key: "createdAt",
            label: "createdAt",
            type: "date",
            editable: false,
            sortable: true
          }
        ],
        items: events,
        indexes: [{ id: "events_type", name: "events_type", keys: ["type"], type: "btree" }]
      }
    }
  };
}

function baseSqlWorkspace(flavor: "postgres" | "mysql"): MockWorkspace {
  const customersTarget: ResourceTarget = {
    database: flavor === "postgres" ? "sales" : "commerce",
    schema: "public",
    entity: "customers",
    kind: "table",
    resourceId: `${flavor}.public.customers`
  };

  const ordersTarget: ResourceTarget = {
    database: flavor === "postgres" ? "sales" : "commerce",
    schema: "public",
    entity: "orders",
    kind: "table",
    resourceId: `${flavor}.public.orders`
  };

  const customers: DbRecord[] = [
    {
      id: 101,
      company: "Northstar Labs",
      owner: "Ava Thompson",
      tier: "enterprise",
      mrr: 6800,
      region: "NA"
    },
    {
      id: 102,
      company: "Lighthouse Foods",
      owner: "Noah Patel",
      tier: "growth",
      mrr: 2400,
      region: "APAC"
    },
    {
      id: 103,
      company: "Horizon Health",
      owner: "Sofia Kim",
      tier: "starter",
      mrr: 840,
      region: "EU"
    }
  ];

  const orders: DbRecord[] = [
    {
      id: 501,
      customer_id: 101,
      amount: 1250,
      status: "paid",
      channel: "stripe",
      created_at: "2026-04-02T10:20:00Z"
    },
    {
      id: 502,
      customer_id: 102,
      amount: 320,
      status: "pending",
      channel: "invoice",
      created_at: "2026-04-03T11:45:00Z"
    },
    {
      id: 503,
      customer_id: 103,
      amount: 140,
      status: "paid",
      channel: "stripe",
      created_at: "2026-04-04T15:00:00Z"
    }
  ];

  const databaseName = flavor === "postgres" ? "sales" : "commerce";

  return {
    tree: [
      {
        id: databaseName,
        name: databaseName,
        kind: "database",
        path: [databaseName],
        children: [
          {
            id: `${databaseName}.public`,
            name: "public",
            kind: "schema",
            path: [databaseName, "public"],
            children: [
              {
                id: customersTarget.resourceId,
                name: "customers",
                kind: "table",
                path: [databaseName, "public", "customers"],
                resourceId: customersTarget.resourceId,
                stats: { count: customers.length }
              },
              {
                id: ordersTarget.resourceId,
                name: "orders",
                kind: "table",
                path: [databaseName, "public", "orders"],
                resourceId: ordersTarget.resourceId,
                stats: { count: orders.length }
              }
            ]
          }
        ]
      }
    ],
    resources: {
      [customersTarget.resourceId]: {
        target: customersTarget,
        columns: [
          { key: "id", label: "id", type: "int", editable: false, sortable: true },
          { key: "company", label: "company", type: "varchar", editable: true, sortable: true },
          { key: "owner", label: "owner", type: "varchar", editable: true, sortable: true },
          { key: "tier", label: "tier", type: "varchar", editable: true, sortable: true },
          { key: "mrr", label: "mrr", type: "numeric", editable: true, sortable: true },
          { key: "region", label: "region", type: "varchar", editable: true, sortable: true }
        ],
        items: customers,
        indexes: [
          {
            id: "customers_company_idx",
            name: "customers_company_idx",
            keys: ["company"],
            type: "btree"
          }
        ]
      },
      [ordersTarget.resourceId]: {
        target: ordersTarget,
        columns: [
          { key: "id", label: "id", type: "int", editable: false, sortable: true },
          {
            key: "customer_id",
            label: "customer_id",
            type: "int",
            editable: true,
            sortable: true
          },
          { key: "amount", label: "amount", type: "numeric", editable: true, sortable: true },
          { key: "status", label: "status", type: "varchar", editable: true, sortable: true },
          { key: "channel", label: "channel", type: "varchar", editable: true, sortable: true },
          {
            key: "created_at",
            label: "created_at",
            type: "timestamp",
            editable: false,
            sortable: true
          }
        ],
        items: orders,
        indexes: [
          {
            id: "orders_customer_id_idx",
            name: "orders_customer_id_idx",
            keys: ["customer_id"],
            type: "btree"
          }
        ]
      }
    }
  };
}

function ensureWorkspace(connection: ConnectionProfile) {
  const existing = mockWorkspaces.get(connection.id);

  if (existing) {
    return existing;
  }

  const workspace =
    connection.type === "mongodb"
      ? baseMongoWorkspace()
      : baseSqlWorkspace(connection.type);

  const cloned = clone(workspace);
  mockWorkspaces.set(connection.id, cloned);
  return cloned;
}

export async function getMockExplorerTree(connection: ConnectionProfile) {
  return ensureWorkspace(connection).tree;
}

export async function getMockRecords(
  connection: ConnectionProfile,
  resource: ResourceTarget,
  params: RecordsQueryParams
): Promise<RecordsResponse> {
  const state = ensureWorkspace(connection).resources[resource.resourceId];
  const filtered = applyFilters(state.items, params);
  const sorted = applySorting(filtered, params.sorting);
  const offset = (params.page - 1) * params.pageSize;

  return {
    columns: state.columns,
    items: sorted.slice(offset, offset + params.pageSize),
    total: sorted.length,
    page: params.page,
    pageSize: params.pageSize
  };
}

export async function createMockRecord(
  connection: ConnectionProfile,
  resource: ResourceTarget,
  payload: DbRecord
) {
  const workspace = ensureWorkspace(connection);
  const state = workspace.resources[resource.resourceId];
  const identifierKey = state.columns[0]?.key ?? "id";

  const nextRecord = {
    [identifierKey]:
      payload[identifierKey] ??
      (identifierKey === "_id" ? createId() : state.items.length + 1001),
    ...payload
  };

  state.items.unshift(nextRecord);
  return nextRecord;
}

export async function updateMockRecord(
  connection: ConnectionProfile,
  resource: ResourceTarget,
  recordId: string,
  patch: DbRecord
) {
  const workspace = ensureWorkspace(connection);
  const state = workspace.resources[resource.resourceId];
  state.items = state.items.map((item) =>
    getRecordId(item) === recordId ? { ...item, ...patch } : item
  );
}

export async function deleteMockRecord(
  connection: ConnectionProfile,
  resource: ResourceTarget,
  recordId: string
) {
  const workspace = ensureWorkspace(connection);
  const state = workspace.resources[resource.resourceId];
  state.items = state.items.filter((item) => getRecordId(item) !== recordId);
}

function buildGeneratedQuery(
  connection: ConnectionProfile,
  resource: ResourceTarget,
  filters: FilterRule[]
) {
  if (connection.type === "mongodb") {
    const mongoFilters = filters.reduce<Record<string, unknown>>((accumulator, filter) => {
      if (!filter.field || !filter.value) {
        return accumulator;
      }

      accumulator[filter.field] =
        filter.operator === "contains"
          ? { $regex: filter.value, $options: "i" }
          : filter.value;

      return accumulator;
    }, {});

    return `db.${resource.entity}.find(${JSON.stringify(mongoFilters, null, 2)})`;
  }

  const where = filters
    .filter((filter) => filter.field && filter.value)
    .map((filter) => `${filter.field} ${operatorToSql(filter.operator)} '${filter.value}'`)
    .join(" AND ");

  return `SELECT * FROM ${resource.schema ? `${resource.schema}.` : ""}${resource.entity}${
    where ? ` WHERE ${where}` : ""
  };`;
}

function operatorToSql(operator: FilterRule["operator"]) {
  switch (operator) {
    case "eq":
      return "=";
    case "neq":
      return "!=";
    case "contains":
      return "ILIKE";
    case "startsWith":
      return "ILIKE";
    case "gt":
      return ">";
    case "lt":
      return "<";
    case "in":
      return "IN";
    default:
      return "=";
  }
}

export async function runMockQuery(
  connection: ConnectionProfile,
  resource: ResourceTarget,
  filters: FilterRule[],
  advancedQuery?: string
): Promise<QueryExecutionResult> {
  const state = ensureWorkspace(connection).resources[resource.resourceId];
  const preview = applyFilters(state.items, { filters, search: "" }).slice(0, 50);

  return {
    preview,
    total: preview.length,
    generatedQuery:
      advancedQuery?.trim() || buildGeneratedQuery(connection, resource, filters)
  };
}

export async function runMockAggregation(
  connection: ConnectionProfile,
  resource: ResourceTarget,
  stages: AggregationStage[]
) {
  const state = ensureWorkspace(connection).resources[resource.resourceId];
  let items = [...state.items];

  for (const stage of stages) {
    try {
      const payload = JSON.parse(stage.value || "{}") as Record<string, unknown>;

      if (stage.stage === "$match") {
        items = items.filter((item) =>
          Object.entries(payload).every(([field, value]) => item[field] === value)
        );
      }

      if (stage.stage === "$sort") {
        const [field, direction] = Object.entries(payload)[0] ?? [];

        if (field) {
          items = [...items].sort((left, right) => {
            const result =
              stringifyValue(left[field]) > stringifyValue(right[field]) ? 1 : -1;
            return Number(direction) === -1 ? -result : result;
          });
        }
      }

      if (stage.stage === "$limit") {
        const limit = Number(payload.limit ?? Object.values(payload)[0] ?? 20);
        items = items.slice(0, limit);
      }

      if (stage.stage === "$project") {
        const fields = Object.entries(payload)
          .filter(([, value]) => Boolean(value))
          .map(([field]) => field);

        items = items.map((item) =>
          Object.fromEntries(Object.entries(item).filter(([field]) => fields.includes(field)))
        );
      }
    } catch {
      continue;
    }
  }

  return items.slice(0, 100);
}

export async function getMockSchema(
  connection: ConnectionProfile,
  resource: ResourceTarget
) {
  const state = ensureWorkspace(connection).resources[resource.resourceId];
  return inferSchema(state.items);
}

export async function getMockIndexes(
  connection: ConnectionProfile,
  resource: ResourceTarget
) {
  return ensureWorkspace(connection).resources[resource.resourceId].indexes;
}

export async function createMockIndex(
  connection: ConnectionProfile,
  resource: ResourceTarget,
  index: Omit<IndexDefinition, "id">
) {
  const state = ensureWorkspace(connection).resources[resource.resourceId];
  state.indexes.unshift({
    ...index,
    id: createId()
  });
}

export async function deleteMockIndex(
  connection: ConnectionProfile,
  resource: ResourceTarget,
  indexId: string
) {
  const state = ensureWorkspace(connection).resources[resource.resourceId];
  state.indexes = state.indexes.filter((index) => index.id !== indexId);
}
