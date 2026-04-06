export const queryKeys = {
  explorer: (connectionId?: string) => ["explorer", connectionId] as const,
  records: (
    connectionId?: string,
    resourceId?: string,
    params?: unknown
  ) => ["records", connectionId, resourceId, params] as const,
  schema: (connectionId?: string, resourceId?: string) =>
    ["schema", connectionId, resourceId] as const,
  indexes: (connectionId?: string, resourceId?: string) =>
    ["indexes", connectionId, resourceId] as const
};
