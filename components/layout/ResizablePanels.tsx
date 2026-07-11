"use client";

import React, { useRef, useState, useEffect } from "react";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { cn } from "../../lib/utils";

interface ResizablePanelsProps {
  sidebar: React.ReactNode;
  editor: React.ReactNode;
  preview: React.ReactNode;
}

export default function ResizablePanels({
  sidebar,
  editor,
  preview,
}: ResizablePanelsProps) {
  const {
    sidebarCollapsed,
    previewCollapsed,
    sidebarWidth,
    editorWidth,
    setPanelSizes,
    toggleSidebar,
  } = useSettingsStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingSidebar = useRef(false);
  const isDraggingSplit = useRef(false);

  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");

  // Setup event listeners for dragging
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();

      if (isDraggingSidebar.current) {
        // Sidebar resizing (px based)
        const newWidth = e.clientX - containerRect.left;
        const constrainedWidth = Math.max(180, Math.min(450, newWidth));
        setPanelSizes(constrainedWidth, editorWidth);
      }

      if (isDraggingSplit.current) {
        // Split editor/preview resizing (percentage based)
        const sidebarOffset = sidebarCollapsed ? 0 : sidebarWidth;
        const remainingWidth = containerRect.width - sidebarOffset;
        if (remainingWidth <= 0) return;

        const editorClientX = e.clientX - containerRect.left - sidebarOffset;
        const newPercent = (editorClientX / remainingWidth) * 100;
        const constrainedPercent = Math.max(15, Math.min(85, newPercent));
        setPanelSizes(sidebarWidth, constrainedPercent);
      }
    };

    const handlePointerUp = () => {
      isDraggingSidebar.current = false;
      isDraggingSplit.current = false;
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [sidebarCollapsed, sidebarWidth, editorWidth, setPanelSizes]);

  const startSidebarResize = (e: React.PointerEvent) => {
    e.preventDefault();
    isDraggingSidebar.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const startSplitResize = (e: React.PointerEvent) => {
    e.preventDefault();
    isDraggingSplit.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const resetSidebarWidth = () => {
    setPanelSizes(260, editorWidth);
  };

  const resetSplitWidth = () => {
    setPanelSizes(sidebarWidth, 50);
  };

  // Compute CSS widths
  const currentSidebarWidth = sidebarCollapsed ? 0 : sidebarWidth;
  const currentEditorWidthPercent = previewCollapsed ? 100 : editorWidth;

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full overflow-hidden bg-[var(--theme-bg)] text-[var(--theme-text)] transition-colors duration-200 p-2 md:p-3 gap-2 md:gap-3 relative"
    >
      {/* Mobile Sidebar Backdrop */}
      {!sidebarCollapsed && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* 1. Sidebar Panel */}
      <div
        className={cn(
          "sidebar-panel h-full flex-none overflow-hidden rounded-2xl bg-[var(--theme-sidebar-bg)] text-[var(--theme-sidebar-text)] shadow-xs transition-all duration-300 ease-out",
          // Mobile: absolute drawer overlay
          "fixed inset-y-2 left-2 z-50 w-[260px] md:relative md:inset-auto md:h-full md:z-auto",
          sidebarCollapsed
            ? "-translate-x-[110%] md:translate-x-0 md:w-0 border-none"
            : "translate-x-0 shadow-2xl md:shadow-sm md:w-[260px]"
        )}
        style={{
          // Desktop uses custom drag widths, mobile collapses via transform translation
          ...(typeof window !== "undefined" && window.innerWidth >= 768
            ? { width: sidebarCollapsed ? "0px" : `${currentSidebarWidth}px` }
            : { width: sidebarCollapsed ? "0px" : "260px" })
        }}
      >
        {!sidebarCollapsed && sidebar}
      </div>

      {/* Sidebar Resizer Gutter */}
      {!sidebarCollapsed && (
        <div
          onPointerDown={startSidebarResize}
          onDoubleClick={resetSidebarWidth}
          className="group relative w-1.5 flex-none cursor-col-resize self-center h-[80%] rounded-full bg-transparent hover:bg-[var(--theme-accent)]/80 transition-all duration-200 hidden md:block"
          title="Drag to resize, double-click to reset"
        >
          <div className="absolute inset-y-0 -left-2 -right-2 z-10" />
        </div>
      )}

      {/* 2. Workspace container (Editor + Preview) */}
      <div className="flex flex-1 h-full min-w-0 overflow-hidden gap-2 md:gap-3 relative">
        {/* Editor Wrapper */}
        <div
          className={cn(
            "editor-panel h-full min-w-0 flex-none overflow-hidden rounded-2xl bg-[var(--theme-editor-bg)] text-[var(--theme-editor-text)] shadow-xs",
            "w-full md:w-auto flex flex-col",
            mobileTab === "edit" ? "flex" : "hidden md:flex"
          )}
          style={{
            // Apply width style only on desktop
            ...(typeof window !== "undefined" && window.innerWidth >= 768
              ? { width: `${currentEditorWidthPercent}%` }
              : {})
          }}
        >
          {editor}
        </div>

        {/* Split Resizer Gutter */}
        {!previewCollapsed && (
          <div
            onPointerDown={startSplitResize}
            onDoubleClick={resetSplitWidth}
            className="group relative w-1.5 flex-none cursor-col-resize self-center h-[80%] rounded-full bg-transparent hover:bg-[var(--theme-accent)]/80 transition-all duration-200 hidden md:block"
            title="Drag to resize, double-click to reset"
          >
            <div className="absolute inset-y-0 -left-2 -right-2 z-10" />
          </div>
        )}

        {/* Preview Wrapper */}
        {!previewCollapsed && (
          <div
            className={cn(
              "preview-panel flex-1 h-full min-w-0 overflow-hidden rounded-2xl bg-[var(--theme-paper-bg)] text-[var(--theme-paper-text)] shadow-xs",
              mobileTab === "preview" ? "block" : "hidden md:block"
            )}
          >
            {preview}
          </div>
        )}

        {/* Mobile Tab Switcher HUD (floating pill at bottom center) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex md:hidden bg-[var(--theme-sidebar-bg)]/90 backdrop-blur-md p-1 rounded-full shadow-lg">
          <button
            onClick={() => setMobileTab("edit")}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-semibold font-mono transition-all cursor-pointer",
              mobileTab === "edit"
                ? "bg-[var(--theme-accent)] text-white shadow"
                : "text-[var(--theme-sidebar-text)] hover:text-[var(--theme-sidebar-active-text)]"
            )}
          >
            Edit
          </button>
          <button
            onClick={() => setMobileTab("preview")}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-semibold font-mono transition-all cursor-pointer",
              mobileTab === "preview"
                ? "bg-[var(--theme-accent)] text-white shadow"
                : "text-[var(--theme-sidebar-text)] hover:text-[var(--theme-sidebar-active-text)]"
            )}
          >
            Preview
          </button>
        </div>
      </div>
    </div>
  );
}
