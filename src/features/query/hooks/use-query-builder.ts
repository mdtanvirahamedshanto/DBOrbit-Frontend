"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { executeQuery } from "@/services/query-service";
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
  connection: ConnectionProfile | undefined,
  resource: ResourceTarget | undefined
) {
  const [rules, setRules] = useState<FilterRule[]>([createEmptyRule()]);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [advancedQuery, setAdvancedQuery] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      executeQuery({
        connection: connection!,
        resource: resource!,
        filters: rules.filter((rule) => rule.field && rule.value),
        advancedQuery: advancedMode ? advancedQuery : undefined
      })
  });

  const canRun = Boolean(connection && resource);
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
