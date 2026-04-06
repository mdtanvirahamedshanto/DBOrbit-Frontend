"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[220px] items-center justify-center rounded-2xl border border-border/80 bg-background/40">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
    </div>
  )
});

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: "json" | "sql" | "javascript";
  height?: number | string;
  readOnly?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  language = "json",
  height = 320,
  readOnly
}: CodeEditorProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/80">
      <MonacoEditor
        height={height}
        language={language}
        theme="vs-dark"
        value={value}
        onChange={(nextValue) => onChange?.(nextValue ?? "")}
        options={{
          minimap: { enabled: false },
          lineNumbersMinChars: 3,
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          padding: { top: 12 },
          readOnly,
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          tabSize: 2
        }}
      />
    </div>
  );
}
