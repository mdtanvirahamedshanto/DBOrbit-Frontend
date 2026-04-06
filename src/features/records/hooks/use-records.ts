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
import {
  ConnectionProfile,
  DbRecord,
  RecordsQueryParams,
  ResourceTarget
} from "@/types";

export function useRecords(
  connection: ConnectionProfile | undefined,
  resource: ResourceTarget | undefined,
  params: RecordsQueryParams
) {
  return useQuery({
    queryKey: queryKeys.records(connection?.id, resource?.resourceId, params),
    queryFn: () =>
      getRecords({
        connection: connection!,
        resource: resource!,
        params
      }),
    enabled: Boolean(connection && resource),
    placeholderData: (previous) => previous
  });
}

export function useRecordMutations(
  connection: ConnectionProfile | undefined,
  resource: ResourceTarget | undefined
) {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["records", connection?.id, resource?.resourceId]
    });
    await queryClient.invalidateQueries({
      queryKey: ["schema", connection?.id, resource?.resourceId]
    });
  };

  const createMutation = useMutation({
    mutationFn: (payload: DbRecord) => createRecord(connection!, resource!, payload),
    onSuccess: async () => {
      toast.success("Record inserted");
      await invalidate();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ recordId, patch }: { recordId: string; patch: DbRecord }) =>
      updateRecord(connection!, resource!, recordId, patch),
    onSuccess: async () => {
      toast.success("Record updated");
      await invalidate();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (recordId: string) => deleteRecord(connection!, resource!, recordId),
    onSuccess: async () => {
      toast.success("Record deleted");
      await invalidate();
    }
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation
  };
}
