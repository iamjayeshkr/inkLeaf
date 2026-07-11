import React from "react";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[var(--theme-bg)] text-[var(--theme-text)] font-sans">
      <h1 className="text-xl font-serif font-bold">Document Not Found</h1>
      <p className="text-xs text-[var(--theme-sidebar-text)]/60 mt-1">The requested view or note does not exist.</p>
      <a
        href="/"
        className="mt-4 text-xs text-[var(--theme-accent)] hover:underline"
      >
        Return to Workspace
      </a>
    </div>
  );
}
