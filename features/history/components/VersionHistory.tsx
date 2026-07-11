"use client";

import React, { useState, useEffect } from "react";
import { useFileStore } from "../../../stores/useFileStore";
import { VersionSnapshot } from "../../../types";
import { cn } from "../../../lib/utils";
import { Clock, Check, RotateCcw, X, History, FileDiff } from "lucide-react";

interface VersionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VersionHistory({ isOpen, onClose }: VersionHistoryProps) {
  const {
    activeFileId,
    files,
    versionHistory,
    loadVersionHistory,
    createVersionSnapshot,
    restoreVersion,
  } = useFileStore();

  const [selectedVersion, setSelectedVersion] = useState<VersionSnapshot | null>(null);

  const activeFile = files.find(f => f.id === activeFileId);

  // Reload history whenever active file changes
  useEffect(() => {
    if (activeFileId) {
      loadVersionHistory(activeFileId);
      setSelectedVersion(null);
    }
  }, [activeFileId, loadVersionHistory]);

  const handleCreateManualSnapshot = async () => {
    if (activeFileId) {
      await createVersionSnapshot(activeFileId, `Manual Save — ${new Date().toLocaleTimeString()}`);
    }
  };

  const handleRestore = async (snapshot: VersionSnapshot) => {
    if (activeFileId && confirm("Are you sure you want to restore this draft? Your current version will be backed up.")) {
      await restoreVersion(activeFileId, snapshot);
      setSelectedVersion(null);
      alert("Version restored successfully!");
    }
  };

  // Simple visual diff algorithm (line-by-line comparison)
  const diffLines = (oldText: string, newText: string) => {
    const oldLines = oldText.split("\n");
    const newLines = newText.split("\n");
    const diff: { type: "added" | "removed" | "normal"; content: string; num?: number }[] = [];

    let oIdx = 0;
    let nIdx = 0;

    while (oIdx < oldLines.length || nIdx < newLines.length) {
      const oldLine = oldLines[oIdx];
      const newLine = newLines[nIdx];

      if (oldLine === newLine) {
        diff.push({ type: "normal", content: oldLine, num: nIdx + 1 });
        oIdx++;
        nIdx++;
      } else if (newLine !== undefined && (oldLine === undefined || !oldLines.includes(newLine, oIdx))) {
        // Line added
        diff.push({ type: "added", content: newLine, num: nIdx + 1 });
        nIdx++;
      } else {
        // Line removed
        diff.push({ type: "removed", content: oldLine });
        oIdx++;
      }
    }

    return diff;
  };

  const diffItems = selectedVersion && activeFile
    ? diffLines(selectedVersion.content, activeFile.content || "")
    : [];

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-[var(--theme-sidebar-bg)] border-l border-[var(--theme-paper-border)]/20 shadow-2xl flex flex-col z-35 select-none animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-[var(--theme-paper-border)]/20">
        <div className="flex items-center gap-1.5">
          <History size={14} className="text-[var(--theme-accent)]" />
          <span className="font-serif text-[13px] font-semibold text-[var(--theme-sidebar-active-text)]">
            Version Timeline
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-[var(--theme-sidebar-active-bg)]/40 text-[var(--theme-sidebar-text)]"
        >
          <X size={15} />
        </button>
      </div>

      {/* Manual snapshot trigger */}
      <div className="p-3 border-b border-[var(--theme-paper-border)]/10">
        <button
          onClick={handleCreateManualSnapshot}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-soft)]/90 text-white rounded-md text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <Clock size={13} />
          <span>Save Backup Snapshot</span>
        </button>
      </div>

      {/* Double Pane content: snapshot list vs diff view */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {!selectedVersion ? (
          // 1. Snapshot list
          <div className="p-2 space-y-1.5 flex-1 overflow-y-auto">
            <div className="px-1.5 text-[9px] uppercase tracking-wider text-[var(--theme-sidebar-text)]/40 font-semibold mb-2">
              Saved Drafts ({versionHistory.length})
            </div>
            
            {versionHistory.length > 0 ? (
              versionHistory.map(snapshot => (
                <div
                  key={snapshot.id}
                  onClick={() => setSelectedVersion(snapshot)}
                  className="p-2.5 rounded-lg hover:bg-[var(--theme-sidebar-active-bg)]/40 cursor-pointer border border-transparent hover:border-[var(--theme-paper-border)]/10 text-xs transition-all group"
                >
                  <div className="flex items-center justify-between font-mono text-[10px] text-[var(--theme-sidebar-text)]/70 mb-1">
                    <span>{new Date(snapshot.timestamp).toLocaleDateString()}</span>
                    <span>{new Date(snapshot.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="font-semibold text-[var(--theme-sidebar-active-text)] truncate">
                    {snapshot.title}
                  </div>
                  <div className="text-[10px] text-[var(--theme-sidebar-text)]/50 mt-1 truncate">
                    {snapshot.content.length} chars · click to view changes
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-[var(--theme-sidebar-text)]/40 italic font-mono">
                No automatic drafts saved yet.<br/>Edits will auto-save here.
              </div>
            )}
          </div>
        ) : (
          // 2. Visual Diff view
          <div className="flex-1 flex flex-col min-h-0">
            {/* Diff header */}
            <div className="p-2 bg-[var(--theme-sidebar-bg)] border-b border-[var(--theme-paper-border)]/10 flex items-center justify-between shrink-0">
              <button
                onClick={() => setSelectedVersion(null)}
                className="text-[10px] font-mono text-[var(--theme-sidebar-text)] hover:text-[var(--theme-accent)] flex items-center gap-1 hover:underline cursor-pointer"
              >
                ← Back to list
              </button>
              
              <button
                onClick={() => handleRestore(selectedVersion)}
                className="flex items-center gap-1 py-1 px-2.5 bg-yellow-600/90 text-white rounded text-[10px] font-semibold hover:bg-yellow-600 transition-colors cursor-pointer shadow-sm"
              >
                <RotateCcw size={10} />
                <span>Restore Draft</span>
              </button>
            </div>

            {/* Scrollable Unified Diff view */}
            <div className="flex-1 overflow-auto p-2 bg-[#0b0d12] text-xs font-mono select-text">
              <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-white/40 font-semibold mb-2 px-1">
                <FileDiff size={11} />
                <span>Diff: Selected vs Current</span>
              </div>

              <div className="space-y-0.5 min-w-max">
                {diffItems.map((line, idx) => (
                  <div
                    key={`diff-${idx}`}
                    className={cn(
                      "px-1 py-0.5 leading-relaxed rounded-sm whitespace-pre",
                      line.type === "added" ? "bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500" :
                      line.type === "removed" ? "bg-red-950/40 text-red-300 border-l-2 border-red-500 line-through" :
                      "text-white/60 opacity-60 pl-2"
                    )}
                  >
                    <span className="inline-block w-6 select-none opacity-20 text-right mr-2 text-[9px]">
                      {line.type === "added" ? "+" : line.type === "removed" ? "-" : line.num}
                    </span>
                    <span>{line.content}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
