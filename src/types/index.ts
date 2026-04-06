export type DatabaseType = "mongodb" | "postgresql" | "mysql";

export interface PersistedConnectionProfile {
  id: string;
  name: string;
  type: DatabaseType;
  redactedUri: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResolvedConnectionProfile extends PersistedConnectionProfile {
  uri?: string;
}

export type ConnectionProfile = ResolvedConnectionProfile;

export type ExplorerNodeKind =
  | "database"
  | "schema"
  | "collection"
  | "table"
  | "view";

export interface ExplorerNode {
  id: string;
  name: string;
  kind: ExplorerNodeKind;
  path: string[];
  resourceId?: string;
  children?: ExplorerNode[];
  stats?: {
    count?: number;
  };
}

export interface ResourceTarget {
  database: string;
  schema?: string;
  entity: string;
  kind: "collection" | "table" | "view";
  resourceId: string;
}

export interface ColumnDefinition {
  key: string;
  label: string;
  type: string;
  editable?: boolean;
  sortable?: boolean;
  width?: number;
}

export type DbRecordValue =
  | string
  | number
  | boolean
  | null
  | Record<string, unknown>
  | unknown[];

export type DbRecord = Record<string, DbRecordValue>;

export interface FilterRule {
  id: string;
  field: string;
  operator:
    | "eq"
    | "neq"
    | "contains"
    | "startsWith"
    | "gt"
    | "lt"
    | "in";
  value: string;
}

export interface SortState {
  id: string;
  desc: boolean;
}

export interface RecordsQueryParams {
  page: number;
  pageSize: number;
  sorting: SortState[];
  filters: FilterRule[];
  search: string;
}

export interface RecordsResponse {
  columns: ColumnDefinition[];
  items: DbRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export interface QueryExecutionResult {
  preview: DbRecord[];
  total: number;
  generatedQuery: string;
}

export interface AggregationStage {
  id: string;
  stage: string;
  value: string;
}

export interface SchemaFieldStat {
  field: string;
  type: string;
  frequency: number;
  nullable: boolean;
  sample?: string;
}

export interface IndexDefinition {
  id: string;
  name: string;
  keys: string[];
  unique?: boolean;
  sparse?: boolean;
  type?: string;
}

export type WorkspaceTab =
  | "records"
  | "json"
  | "query"
  | "aggregation"
  | "schema"
  | "indexes";
