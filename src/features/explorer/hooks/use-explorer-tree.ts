"use client";

import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getCollections, getDatabases } from "@/services/explorer-service";
import { DatabaseType, ExplorerNode } from "@/types";

export function useDatabases(connectionId?: string) {
  return useQuery({
    queryKey: queryKeys.databases(connectionId),
    queryFn: () => getDatabases(connectionId!),
    enabled: Boolean(connectionId)
  });
}

export function useCollections(connectionId?: string, db?: string) {
  return useQuery({
    queryKey: queryKeys.collections(connectionId, db),
    queryFn: () => getCollections(connectionId!, db!),
    enabled: Boolean(connectionId && db)
  });
}

function buildMongoDatabaseNode(database: string, collections: string[]): ExplorerNode {
  return {
    id: `db:${database}`,
    name: database,
    kind: "database",
    path: [database],
    children: collections.map((collection) => ({
      id: `collection:${database}:${collection}`,
      name: collection,
      kind: "collection",
      path: [database, collection],
      resourceId: `${database}:${collection}`
    }))
  };
}

function buildSqlDatabaseNode(
  database: string,
  collections: string[],
  type: DatabaseType
): ExplorerNode {
  if (type !== "postgres") {
    return {
      id: `db:${database}`,
      name: database,
      kind: "database",
      path: [database],
      children: collections.map((collection) => ({
        id: `table:${database}:${collection}`,
        name: collection,
        kind: "table",
        path: [database, collection],
        resourceId: `${database}:${collection}`
      }))
    };
  }

  const schemaMap = new Map<string, ExplorerNode[]>();

  for (const entry of collections) {
    const [schema, table] = entry.includes(".") ? entry.split(".", 2) : ["public", entry];
    const nodes = schemaMap.get(schema) ?? [];
    nodes.push({
      id: `table:${database}:${schema}.${table}`,
      name: table,
      kind: "table",
      path: [database, schema, table],
      resourceId: `${database}:${schema}.${table}`
    });
    schemaMap.set(schema, nodes);
  }

  return {
    id: `db:${database}`,
    name: database,
    kind: "database",
    path: [database],
    children: Array.from(schemaMap.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([schema, tables]) => ({
        id: `schema:${database}:${schema}`,
        name: schema,
        kind: "schema",
        path: [database, schema],
        children: tables.sort((left, right) => left.name.localeCompare(right.name))
      }))
  };
}

export function useExplorerTree(connectionId?: string, connectionType?: DatabaseType) {
  const databasesQuery = useDatabases(connectionId);
  const databaseNames = databasesQuery.data ?? [];

  const collectionQueries = useQueries({
    queries: databaseNames.map((database) => ({
      queryKey: queryKeys.collections(connectionId, database),
      queryFn: () => getCollections(connectionId!, database),
      enabled: Boolean(connectionId)
    }))
  });

  const isLoading =
    databasesQuery.isLoading ||
    collectionQueries.some((query) => query.isLoading || query.isPending);
  const isError = databasesQuery.isError || collectionQueries.some((query) => query.isError);

  const data = useMemo(() => {
    if (!connectionType) {
      return [];
    }

    return databaseNames.map((database, index) => {
      const collections = collectionQueries[index]?.data ?? [];

      if (connectionType === "mongodb") {
        return buildMongoDatabaseNode(database, collections);
      }

      return buildSqlDatabaseNode(database, collections, connectionType);
    });
  }, [collectionQueries, connectionType, databaseNames]);

  return {
    data,
    isLoading,
    isError,
    error:
      databasesQuery.error ??
      collectionQueries.find((query) => query.error)?.error,
    refetch: async () => {
      await databasesQuery.refetch();
      await Promise.all(collectionQueries.map((query) => query.refetch()));
    }
  };
}
