"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { executeQuery } from "@/services/query-service";
import { queryKeys } from "@/lib/query-keys";
import { ConnectionProfile, FilterRule, ResourceTarget } from "@/types";

export function createEmptyRule(): FilterRule {
  return {
    id: crypto.randomUUID(),
    field: "",
    operator: "eq",
    value: ""
  };
}

export function useQueryBuilder(
  connectionId: string | undefined,
  connection: ConnectionProfile | undefined,
  resource: ResourceTarget | undefined
) {
  const queryClient = useQueryClient();
  const [rules, setRules] = useState<FilterRule[]>([createEmptyRule()]);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [advancedQuery, setAdvancedQuery] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      executeQuery({
        connectionId: connectionId!,
        connection: connection!,
        resource: resource!,
        filters: rules.filter((rule) => rule.field && rule.value),
        advancedQuery: advancedMode ? advancedQuery : undefined
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.records(connectionId, resource?.database, resource?.resourceId)
      });
    }
  });

  const canRun = Boolean(connectionId && connection && resource);
  const normalizedRules = useMemo(
    () => rules.filter((rule) => rule.field || rule.value),
    [rules]
  );

  return {
    rules,
    normalizedRules,
    setRules,
    advancedMode,
    setAdvancedMode,
    advancedQuery,
    setAdvancedQuery,
    runQuery: () => mutation.mutate(),
    queryResult: mutation.data,
    isRunning: mutation.isPending,
    canRun
  };
}
