"use client";

import React, { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global boundary error:", error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[var(--theme-bg)] text-[var(--theme-text)] font-sans">
      <h1 className="text-xl font-serif font-bold">Something went wrong</h1>
      <p className="text-xs text-[var(--theme-sidebar-text)]/60 mt-1">An unexpected error occurred in the workspace.</p>
      <button
        onClick={() => reset()}
        className="mt-4 px-4 py-2 bg-[var(--theme-accent)] text-white hover:bg-[var(--theme-accent-soft)] rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
      >
        Reload Workspace
      </button>
    </div>
  );
}
