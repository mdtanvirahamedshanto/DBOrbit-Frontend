"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterRule } from "@/types";

const operators: Array<{ label: string; value: FilterRule["operator"] }> = [
  { label: "Equals", value: "eq" },
  { label: "Not equal", value: "neq" },
  { label: "Contains", value: "contains" },
  { label: "Starts with", value: "startsWith" },
  { label: "Greater than", value: "gt" },
  { label: "Less than", value: "lt" },
  { label: "In list", value: "in" }
];

export function FilterRuleRow({
  rule,
  fields,
  onChange,
  onDelete,
  autoFocusTarget
}: {
  rule: FilterRule;
  fields: string[];
  onChange: (rule: FilterRule) => void;
  onDelete: () => void;
  autoFocusTarget?: boolean;
}) {
  return (
    <div className="grid gap-2 rounded-2xl border border-border/80 bg-secondary/20 p-3 md:grid-cols-[1.2fr_0.9fr_1fr_auto]">
      <select
        data-query-first-field={autoFocusTarget ? "true" : undefined}
        value={rule.field}
        onChange={(event) => onChange({ ...rule, field: event.target.value })}
        className="focus-ring h-10 rounded-xl border border-input bg-background/40 px-3 text-sm"
      >
        <option value="">Field</option>
        {fields.map((field) => (
          <option key={field} value={field}>
            {field}
          </option>
        ))}
      </select>

      <select
        value={rule.operator}
        onChange={(event) =>
          onChange({ ...rule, operator: event.target.value as FilterRule["operator"] })
        }
        className="focus-ring h-10 rounded-xl border border-input bg-background/40 px-3 text-sm"
      >
        {operators.map((operator) => (
          <option key={operator.value} value={operator.value}>
            {operator.label}
          </option>
        ))}
      </select>

      <Input
        placeholder="Value"
        value={rule.value}
        onChange={(event) => onChange({ ...rule, value: event.target.value })}
      />

      <Button variant="ghost" size="icon" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
