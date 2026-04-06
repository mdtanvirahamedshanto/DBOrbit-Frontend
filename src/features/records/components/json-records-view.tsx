"use client";

import { CodeEditor } from "@/components/ui/code-editor";
import { DbRecord } from "@/types";

export function JsonRecordsView({ items }: { items: DbRecord[] }) {
  return (
    <CodeEditor
      language="json"
      value={JSON.stringify(items, null, 2)}
      height="65vh"
      readOnly
    />
  );
}
