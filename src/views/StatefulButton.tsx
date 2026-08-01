"use client";

import { useRef, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

type StatefulButtonProps = {
  /** The async work. Resolve = success, throw/reject = error. */
  onAction: () => Promise<void>;
  idleLabel?: string;
  errorLabel?: string;
  disabled?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
};

// Status → background token. Idle uses the app's primary (black); success/error use design tokens.
const BG: Record<Status, string> = {
  idle: "bg-primary hover:opacity-90",
  loading: "bg-primary",
  success: "bg-secondary",
  error: "bg-error",
};

export function StatefulButton({
  onAction,
  idleLabel = "Search",
  errorLabel = "Retry",
  disabled = false,
  ref,
}: StatefulButtonProps) {
  const [status, setStatus] = useState<Status>("idle");
  const timer = useRef<number | undefined>(undefined);

  async function handleClick() {
    if (status === "loading") return; // interruptible: ignore spam-clicks mid-flight
    clearTimeout(timer.current);
    setStatus("loading");
    try {
      await onAction();
      setStatus("success");
    } catch {
      setStatus("error");
    }
    timer.current = window.setTimeout(() => setStatus("idle"), 1600);
  }

  const labelShown = status === "idle" || status === "error";

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-busy={status === "loading"}
      className={`relative h-[52px] min-w-[128px] overflow-hidden rounded-lg px-6 font-bold text-on-primary
        shadow-sm outline-none transition-[background-color] duration-200 ease-out
        focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        motion-safe:active:scale-95 motion-safe:transition-[background-color,transform]
        ${BG[status]} ${status === "error" ? "sb-shake" : ""}`}
    >
      <span className={`sb-layer ${labelShown ? "is-in" : "is-out"}`}>
        {status === "error" ? errorLabel : idleLabel}
      </span>
      <span className={`sb-layer ${status === "loading" ? "is-in" : "is-out"}`} aria-hidden>
        <span className="sb-spinner" />
      </span>
      <span className={`sb-layer sb-check ${status === "success" ? "is-in" : "is-out"}`} aria-hidden>
        <span className="material-symbols-outlined">check</span>
      </span>
    </button>
  );
}
