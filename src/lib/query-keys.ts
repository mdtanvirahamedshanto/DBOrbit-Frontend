export const queryKeys = {
  databases: (connectionId?: string) => ["databases", connectionId] as const,
  collections: (connectionId?: string, db?: string) =>
    ["collections", connectionId, db] as const,
  explorer: (connectionId?: string, type?: string) =>
    ["explorer", connectionId, type] as const,
  records: (
    connectionId?: string,
    database?: string,
    collection?: string,
    params?: unknown
  ) => ["records", connectionId, database, collection, params] as const,
  schema: (connectionId?: string, database?: string, collection?: string) =>
    ["schema", connectionId, database, collection] as const,
  indexes: (connectionId?: string, database?: string, collection?: string) =>
    ["indexes", connectionId, database, collection] as const
};
