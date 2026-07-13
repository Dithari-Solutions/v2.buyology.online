"use client";

import { useRef, useState } from "react";
import {
  CloseIcon,
  FileTextIcon,
  ImageIcon,
  UploadIcon,
} from "@/components/icons";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Trade-licence style file picker: click or drag & drop; shows the chosen file. */
export function FileUpload({
  label,
  hint,
  cta,
  removeLabel,
  accept = ".pdf,image/*",
  required,
  file,
  onChange,
}: {
  label: string;
  hint: string;
  cta: string;
  removeLabel: string;
  accept?: string;
  required?: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const isPdf = file?.type.includes("pdf");

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </span>

      {file ? (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              isPdf
                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                : "bg-brand-soft text-brand-icon"
            }`}
          >
            {isPdf ? (
              <FileTextIcon className="h-5 w-5" />
            ) : (
              <ImageIcon className="h-5 w-5" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {file.name}
            </p>
            <p className="text-xs text-muted">{formatSize(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            aria-label={removeLabel}
            className="rounded-md p-1.5 text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) onChange(f);
          }}
          className={`flex w-full flex-col items-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            dragOver
              ? "border-brand bg-brand-soft"
              : "border-border hover:border-border-strong"
          }`}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-brand-icon">
            <UploadIcon className="h-5 w-5" />
          </span>
          <span className="text-sm font-medium text-foreground">{cta}</span>
          <span className="text-xs text-muted">{hint}</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        required={required && !file}
        className="sr-only"
        aria-label={label}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
