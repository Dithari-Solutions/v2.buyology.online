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
 * The strings below are the only ones this control does not receive as props.
 * They belong in `t.account.profile` in lib/i18n/dictionaries.ts; move them there
 * (and add matching props) when the dictionary keys land.
 */
const copy = {
  notAnImage: "That file isn’t an image. Choose a PNG, JPG or WebP instead.",
  tooLarge: (size: string) =>
    `That image is ${size}. Choose one under 5 MB, or resize it first.`,
  previewAlt: "Profile picture preview",
  selected: (fileName: string) => `${fileName} selected.`,
  removed: "Profile picture removed.",
};

/**
 * Optional profile picture: initials by default, click or drag & drop to pick an
 * image, then change or remove it. Purely CSS transitions, so the global
 * `prefers-reduced-motion` block in app/globals.css already neutralises the motion.
 */
export function AvatarUpload({
  label,
  hint,
  chooseLabel,
  changeLabel,
  removeLabel,
  initials,
  name,
}: {
  label: string;
  hint: string;
  chooseLabel: string;
  changeLabel: string;
  removeLabel: string;
  initials: string;
  name: string;
}) {
  const uid = useId();
  const inputId = `${uid}-avatar`;
  const labelId = `${uid}-label`;
  const hintId = `${uid}-hint`;
  const errorId = `${uid}-error`;

  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // Mirrors `preview` so the unmount cleanup below can revoke the live URL
  // without re-running (and revoking early) on every change.
  const previewRef = useRef<string | null>(null);

  // Revoke on unmount; `showPreview` revokes on every replace/remove.
  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    },
    [],
  );

  /** Swap the object URL, always revoking the one it replaces. */
  function showPreview(next: File | null) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const url = next ? URL.createObjectURL(next) : null;
    previewRef.current = url;
    setPreview(url);
  }

  function clearInput() {
    // Without this, re-picking the very same file fires no `change` event.
    if (inputRef.current) inputRef.current.value = "";
  }

  function accept(next: File) {
    if (!next.type.startsWith("image/")) {
      setError(copy.notAnImage);
      setStatus(copy.notAnImage);
      clearInput();
      return;
    }
    if (next.size > MAX_BYTES) {
      const message = copy.tooLarge(formatSize(next.size));
      setError(message);
      setStatus(message);
      clearInput();
      return;
    }
    setError(null);
    setFile(next);
    showPreview(next);
    setStatus(copy.selected(next.name));
  }

  function onRemove() {
    setFile(null);
    showPreview(null);
    setError(null);
    setStatus(copy.removed);
    clearInput();
    // The remove button unmounts on click, so hand focus back to the input
    // (its ring shows on the visible "choose" label) instead of dropping to body.
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
        {/* Pointer-only convenience: click and drag & drop mirror the labelled
            button beside it, which stays the keyboard and screen-reader path. */}
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
            if (dropped) accept(dropped);
          }}
          className={`relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 bg-brand-soft text-brand-icon transition-colors ${
            dragOver
              ? "border-solid border-brand"
              : preview
                ? "border-solid border-border"
                : "border-dashed border-border-strong"
          }`}
        >
          {preview ? (
            // next/image can't take a blob: URL — its `src` must be an internal
            // path, a configured remote URL or a static import
            // (node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md),
            // and there is nothing to optimise for a local, never-served preview.
            <img
              src={preview}
              alt={copy.previewAlt}
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
                if (picked) accept(picked);
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

      {/* Mounted up front so the text swap is announced. */}
      <span className="sr-only" role="status" aria-live="polite">
        {status}
      </span>
    </div>
  );
}
