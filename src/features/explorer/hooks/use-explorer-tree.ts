"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getExplorerTree } from "@/services/explorer-service";
import { ConnectionProfile } from "@/types";

export function useExplorerTree(connection?: ConnectionProfile) {
  return useQuery({
    queryKey: queryKeys.explorer(connection?.id),
    queryFn: () => getExplorerTree(connection!),
    enabled: Boolean(connection)
  });
}
