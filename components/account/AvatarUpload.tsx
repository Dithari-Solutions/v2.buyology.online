"use client";

import { useEffect, useId, useRef, useState } from "react";
import { PencilIcon, TrashIcon, UploadIcon } from "@/components/icons";

const MAX_BYTES = 5 * 1024 * 1024;

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Optional profile picture: initials by default, click or drag & drop the avatar
 * to pick an image, then change or remove it. Nothing is required — there is no
 * `required` on the input and no asterisk on the label.
 *
 * Motion is CSS-only (colour transitions), so the global `prefers-reduced-motion`
 * block in app/globals.css already collapses it; no per-component guard needed.
 */
export function AvatarUpload({
  label,
  hint,
  chooseLabel,
  changeLabel,
  removeLabel,
  initials,
  name,
  notAnImageLabel,
  tooLargeLabel,
  previewAltLabel,
  selectedLabel,
  removedLabel,
  onFile,
  currentUrl,
}: {
  label: string;
  hint: string;
  chooseLabel: string;
  changeLabel: string;
  removeLabel: string;
  initials: string;
  name: string;
  /** Shown when the picked file is not an image. */
  notAnImageLabel: string;
  /** Shown when the image exceeds the size cap; the actual size is appended. */
  tooLargeLabel: string;
  previewAltLabel: string;
  /** Announced with the file name appended, e.g. "Photo selected: cat.png". */
  selectedLabel: string;
  removedLabel: string;
  /**
   * The picked file, for callers that upload it themselves. Needed because this component clears
   * the input's value after picking (to allow re-picking the same file), so the file is NOT in the
   * form's FormData at submit time.
   */
  onFile?: (file: File | null) => void;
  /** The already-saved avatar, shown until a new file is picked. */
  currentUrl?: string | null;
}) {
  const uid = useId();
  const inputId = `${uid}-avatar`;
  const labelId = `${uid}-label`;
  const hintId = `${uid}-hint`;
  const errorId = `${uid}-error`;

  const inputRef = useRef<HTMLInputElement>(null);
  // File and its object URL are held together so the two can never drift apart.
  const [picked, setPicked] = useState<{ file: File; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const file = picked?.file ?? null;
  const preview = picked?.url ?? null;

  // Mirrors `picked` so the unmount cleanup can revoke whatever URL is live
  // without depending on state (a dep here would revoke early, on every change).
  const pickedRef = useRef<{ file: File; url: string } | null>(null);

  // Revoke on unmount. `replacePreview` covers replace and remove; between the
  // two, an object URL never outlives the component or the file it points at.
  useEffect(
    () => () => {
      if (pickedRef.current) URL.revokeObjectURL(pickedRef.current.url);
      pickedRef.current = null;
    },
    [],
  );

  /** Swap the preview, always revoking the URL it replaces. */
  function replacePreview(next: File | null) {
    if (pickedRef.current) URL.revokeObjectURL(pickedRef.current.url);
    const entry = next ? { file: next, url: URL.createObjectURL(next) } : null;
    pickedRef.current = entry;
    setPicked(entry);
    onFile?.(next);
  }

  /** Re-picking the same file fires no `change` event unless the value is cleared. */
  function clearInputValue() {
    if (inputRef.current) inputRef.current.value = "";
  }

  function selectFile(next: File) {
    if (!next.type.startsWith("image/")) {
      setError(notAnImageLabel);
      clearInputValue();
      return;
    }
    if (next.size > MAX_BYTES) {
      setError(`${tooLargeLabel} (${formatSize(next.size)})`);
      clearInputValue();
      return;
    }
    setError(null);
    replacePreview(next);
    setStatus(`${selectedLabel}: ${next.name}`);
  }

  function onRemove() {
    replacePreview(null);
    setError(null);
    setStatus(removedLabel);
    clearInputValue();
    // This button unmounts on click, so hand focus back to the file input (its
    // ring shows on the visible label) rather than letting it fall to <body>.
    inputRef.current?.focus();
  }

  return (
    <div role="group" aria-labelledby={labelId}>
      <span
        id={labelId}
        className="mb-1.5 block text-sm font-medium text-foreground"
      >
        {label}
      </span>

      <div className="flex items-center gap-4">
        {/* Pointer-only convenience. The labelled control beside it stays the
            keyboard and screen-reader path, so this is never the sole affordance. */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const dropped = e.dataTransfer.files?.[0];
            if (dropped) selectFile(dropped);
          }}
          className={`relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 bg-brand-soft text-brand-icon transition-colors ${
            dragOver
              ? "border-solid border-brand"
              : preview
                ? "border-solid border-border"
                : "border-dashed border-border-strong"
          }`}
        >
          {preview || currentUrl ? (
            // next/image cannot take a blob: URL, and the saved avatar is a presigned,
            // short-lived S3 URL — neither is optimisable, so a plain <img> for both.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview ?? currentUrl!}
              alt={previewAltLabel}
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          ) : (
            <span aria-hidden="true" className="text-lg font-bold">
              {initials}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {/* Visually hidden but focusable and in the tab order — never `hidden`. */}
            <input
              ref={inputRef}
              id={inputId}
              name={name}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              aria-describedby={error ? `${hintId} ${errorId}` : hintId}
              aria-invalid={error ? true : undefined}
              className="peer sr-only"
              onChange={(e) => {
                const picked = e.target.files?.[0];
                if (picked) selectFile(picked);
              }}
            />
            <label
              htmlFor={inputId}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface"
            >
              {file ? (
                <PencilIcon aria-hidden="true" className="h-4 w-4" />
              ) : (
                <UploadIcon aria-hidden="true" className="h-4 w-4" />
              )}
              {file ? changeLabel : chooseLabel}
            </label>

            {file && (
              <button
                type="button"
                onClick={onRemove}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <TrashIcon aria-hidden="true" className="h-4 w-4" />
                {removeLabel}
              </button>
            )}
          </div>

          <p id={hintId} className="mt-1.5 text-xs text-muted">
            {hint}
          </p>
          {error && (
            <p
              id={errorId}
              role="alert"
              className="mt-1.5 text-xs font-medium text-warn"
            >
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Mounted up front so the text swap is announced when it changes. */}
      <span className="sr-only" role="status" aria-live="polite">
        {status}
      </span>
    </div>
  );
}
