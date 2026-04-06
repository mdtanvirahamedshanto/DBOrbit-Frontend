"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import {
  createRecord,
  deleteRecord,
  getRecords,
  updateRecord
} from "@/services/records-service";
import { DbRecord, RecordsQueryParams, ResourceTarget } from "@/types";

export function useRecords(
  connectionId: string | undefined,
  resource: ResourceTarget | undefined,
  params: RecordsQueryParams
) {
  return useQuery({
    queryKey: queryKeys.records(
      connectionId,
      resource?.database,
      resource?.resourceId,
      params
    ),
    queryFn: () =>
      getRecords({
        connectionId: connectionId!,
        resource: resource!,
        params
      }),
    enabled: Boolean(connectionId && resource),
    placeholderData: (previous) => previous
  });
}

export function useInsert(connectionId?: string, resource?: ResourceTarget) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DbRecord) => createRecord(connectionId!, resource!, payload),
    onSuccess: async () => {
      toast.success("Record inserted");
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.records(connectionId, resource?.database, resource?.resourceId)
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.schema(connectionId, resource?.database, resource?.resourceId)
        })
      ]);
    }
  });
}

export function useUpdate(connectionId?: string, resource?: ResourceTarget) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { currentRecord: DbRecord; patch: DbRecord }) =>
      updateRecord(connectionId!, resource!, input.currentRecord, input.patch),
    onSuccess: async () => {
      toast.success("Record updated");
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.records(connectionId, resource?.database, resource?.resourceId)
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.schema(connectionId, resource?.database, resource?.resourceId)
        })
      ]);
    }
  });
}

export function useDelete(connectionId?: string, resource?: ResourceTarget) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (currentRecord: DbRecord) => deleteRecord(connectionId!, resource!, currentRecord),
    onSuccess: async () => {
      toast.success("Record deleted");
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.records(connectionId, resource?.database, resource?.resourceId)
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.schema(connectionId, resource?.database, resource?.resourceId)
        })
      ]);
    }
  });
}

export function useRecordMutations(connectionId?: string, resource?: ResourceTarget) {
  return {
    createMutation: useInsert(connectionId, resource),
    updateMutation: useUpdate(connectionId, resource),
    deleteMutation: useDelete(connectionId, resource)
  };
}
