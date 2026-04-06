"use client";

import { useMemo, useRef, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type Row
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { PencilLine, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ColumnDefinition, DbRecord, SortState } from "@/types";

function stringifyValue(value: unknown) {
  if (value === null || value === undefined) {
    return "null";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function getRecordId(record: DbRecord) {
  return String(record.id ?? record._id ?? stringifyValue(record));
}

function parseValue(rawValue: string, columnType: string) {
  if (columnType === "boolean") {
    return rawValue === "true";
  }

  if (
    ["number", "numeric", "int", "integer", "float", "double"].includes(
      columnType.toLowerCase()
    )
  ) {
    const parsed = Number(rawValue);
    return Number.isNaN(parsed) ? rawValue : parsed;
  }

  if ((rawValue.startsWith("{") && rawValue.endsWith("}")) || (rawValue.startsWith("[") && rawValue.endsWith("]"))) {
    try {
      return JSON.parse(rawValue) as unknown;
    } catch {
      return rawValue;
    }
  }

  return rawValue;
}

interface RecordsTableProps {
  columns: ColumnDefinition[];
  items: DbRecord[];
  sorting: SortState[];
  onSortingChange: (sorting: SortState[]) => void;
  onInlineSave: (recordId: string, patch: DbRecord) => Promise<void>;
  onEdit: (record: DbRecord) => void;
  onDelete: (recordId: string) => Promise<void>;
}

export function RecordsTable({
  columns,
  items,
  sorting,
  onSortingChange,
  onInlineSave,
  onEdit,
  onDelete
}: RecordsTableProps) {
  const [editingCell, setEditingCell] = useState<{
    recordId: string;
    field: string;
    value: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const tableColumns = useMemo<ColumnDef<DbRecord>[]>(
    () => [
      ...columns.map((column) => ({
        accessorKey: column.key,
        header: () => {
          const currentSort = sorting.find((item) => item.id === column.key);

          return (
            <button
              className="flex items-center gap-2 text-left font-medium"
              onClick={() =>
                onSortingChange(
                  currentSort
                    ? [{ id: column.key, desc: !currentSort.desc }]
                    : [{ id: column.key, desc: false }]
                )
              }
            >
              <span>{column.label}</span>
              {currentSort ? <Badge variant="outline">{currentSort.desc ? "DESC" : "ASC"}</Badge> : null}
            </button>
          );
        },
        cell: ({ row }: { row: Row<DbRecord> }) => {
          const record = row.original;
          const recordId = getRecordId(record);
          const isEditing =
            editingCell?.recordId === recordId && editingCell.field === column.key;
          const rawValue = record[column.key];

          if (isEditing) {
            return (
              <Input
                autoFocus
                value={editingCell.value}
                onChange={(event) =>
                  setEditingCell((current) =>
                    current ? { ...current, value: event.target.value } : current
                  )
                }
                onBlur={async () => {
                  if (editingCell.value !== stringifyValue(rawValue)) {
                    const patch = {
                      [column.key]: parseValue(editingCell.value, column.type)
                    } as DbRecord;
                    await onInlineSave(recordId, patch);
                  }
                  setEditingCell(null);
                }}
                onKeyDown={async (event) => {
                  if (event.key === "Enter") {
                    const patch = {
                      [column.key]: parseValue(editingCell.value, column.type)
                    } as DbRecord;
                    await onInlineSave(recordId, patch);
                    setEditingCell(null);
                  }

                  if (event.key === "Escape") {
                    setEditingCell(null);
                  }
                }}
                className="h-8"
              />
            );
          }

          return (
            <button
              className={cn(
                "w-full rounded-lg px-2 py-1 text-left text-sm hover:bg-secondary/50",
                column.editable ? "cursor-text" : "cursor-default"
              )}
              onDoubleClick={() => {
                if (!column.editable) {
                  return;
                }

                setEditingCell({
                  recordId,
                  field: column.key,
                  value: stringifyValue(rawValue)
                });
              }}
            >
              <span className="block truncate">
                {typeof rawValue === "boolean" ? String(rawValue) : stringifyValue(rawValue)}
              </span>
            </button>
          );
        }
      })),
      {
        id: "actions",
        header: () => <span>Actions</span>,
        cell: ({ row }: { row: Row<DbRecord> }) => (
          <div className="flex items-center justify-end gap-1">
            <Button size="icon" variant="ghost" onClick={() => onEdit(row.original)}>
              <PencilLine className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setDeleteTarget(getRecordId(row.original))}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )
      }
    ],
    [columns, editingCell, onEdit, onInlineSave, onSortingChange, sorting]
  );

  const table = useReactTable({
    data: items,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel()
  });

  const parentRef = useRef<HTMLDivElement | null>(null);
  const rows = table.getRowModel().rows;
  const gridTemplateColumns = `${columns
    .map(() => "minmax(160px, 1fr)")
    .join(" ")} 120px`;
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 10
  });

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/60">
        <div
          className="grid border-b border-border/80 bg-secondary/30 px-3 py-2 text-sm text-muted-foreground"
          style={{ gridTemplateColumns }}
        >
          {table.getFlatHeaders().map((header) => (
            <div key={header.id} className="px-2">
              {header.isPlaceholder
                ? null
                : flexRender(header.column.columnDef.header, header.getContext())}
            </div>
          ))}
        </div>

        <div ref={parentRef} className="max-h-[58vh] overflow-auto">
          <div
            style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <div
                  key={row.id}
                  className="grid border-b border-border/60 px-3 py-2"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                    gridTemplateColumns
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <div key={cell.id} className="px-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action removes the row or document from the current resource.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleteTarget) {
                  await onDelete(deleteTarget);
                }
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
