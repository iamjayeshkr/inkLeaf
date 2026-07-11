"use client";

import React, { useMemo } from "react";
import { useFileStore } from "../../stores/useFileStore";
import { cn } from "../../lib/utils";
import { Clock, FileText, Database, ShieldAlert, History } from "lucide-react";

interface StatusBarProps {
  onOpenHistory: () => void;
  isHistoryOpen: boolean;
}

export default function StatusBar({
  onOpenHistory,
  isHistoryOpen,
}: StatusBarProps) {
  const { files, activeFileId } = useFileStore();

  const activeFile = files.find(f => f.id === activeFileId);

  // Clean markdown formatting to get actual prose text
  const cleanMarkdownForStats = (md: string): string => {
    // Remove code blocks
    let clean = md.replace(/```[a-z]*\n[\s\S]*?\n```/g, "");
    // Remove HTML tags
    clean = clean.replace(/<\/?[^>]+(>|$)/g, "");
    // Remove inline code
    clean = clean.replace(/`([^`]+)`/g, "$1");
    // Remove headers formatting
    clean = clean.replace(/^#+\s+/gm, "");
    // Remove bold/italic decorators
    clean = clean.replace(/(\*\*|__)(.*?)\1/g, "$2");
    clean = clean.replace(/(\*|_)(.*?)\1/g, "$2");
    // Remove links (keep link text, remove URL)
    clean = clean.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
    // Remove image tags
    clean = clean.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "");
    // Remove blockquote markers
    clean = clean.replace(/^\s*>\s*/gm, "");
    // Remove list markers
    clean = clean.replace(/^\s*[-*+]\s+/gm, "");
    clean = clean.replace(/^\s*\d+\.\s+/gm, "");
    return clean.trim();
  };

  // Statistics Hook
  const stats = useMemo(() => {
    if (!activeFile || activeFile.type !== "file" || !activeFile.content) {
      return { words: 0, chars: 0, readingTime: 0 };
    }
    const cleanText = cleanMarkdownForStats(activeFile.content);
    
    // Multilingual Word Count: English words + CJK characters
    const cjkMatches = cleanText.match(/[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff]/g);
    const cjkCount = cjkMatches ? cjkMatches.length : 0;
    
    const englishText = cleanText.replace(/[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff]/g, " ");
    const wordsMatches = englishText.trim().match(/\b\w+\b/g);
    const englishWordCount = wordsMatches ? wordsMatches.length : 0;
    
    const words = englishWordCount + cjkCount;
    const chars = cleanText.length;
    
    // Estimated reading speed: 200 words per minute (WPM)
    let readingTime = "0 min read";
    if (words > 0) {
      if (words < 200) {
        const seconds = Math.max(1, Math.ceil((words / 200) * 60));
        readingTime = `${seconds}s read`;
      } else {
        const minutes = Math.ceil(words / 200);
        readingTime = `${minutes} min read`;
      }
    }

    return { words, chars, readingTime };
  }, [activeFile]);

  // Hierarchical Breadcrumbs
  const breadcrumbs = useMemo(() => {
    if (!activeFile) return [];
    
    const crumbs = [activeFile.name];
    let parentId = activeFile.parentId;

    while (parentId) {
      const parent = files.find(f => f.id === parentId);
      if (parent) {
        crumbs.unshift(parent.name);
        parentId = parent.parentId;
      } else {
        break;
      }
    }
    return crumbs;
  }, [activeFile, files]);

  return (
    <footer className="flex flex-none items-center justify-between h-7 bg-[var(--theme-sidebar-bg)] px-4 font-mono text-[10px] text-[var(--theme-sidebar-text)]/70 select-none z-20">
      
      {/* 1. Breadcrumbs */}
      <div className="flex items-center gap-1 truncate max-w-[40%]">
        <Database size={11} className="text-[var(--theme-accent)] shrink-0" />
        {breadcrumbs.length > 0 ? (
          <span className="truncate">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="mx-1 opacity-40">/</span>}
                <span className={cn(idx === breadcrumbs.length - 1 ? "text-[var(--theme-sidebar-active-text)] font-semibold" : "")}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </span>
        ) : (
          <span className="opacity-50">Local Workspace</span>
        )}
      </div>

      {/* 2. Right Stats Row */}
      <div className="flex items-center gap-4 shrink-0">
        
        {/* Word Counts */}
        {activeFile && (
          <>
            <span className="hidden sm:flex items-center gap-1">
              <FileText size={11} />
              <span>
                {stats.words} words · {stats.chars} chars
              </span>
            </span>
            <span className="hidden md:flex items-center gap-1">
              <Clock size={11} />
              <span>{stats.readingTime}</span>
            </span>
          </>
        )}

        {/* Sync Status */}
        <span className="flex items-center gap-1 text-[var(--theme-accent)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-accent)] animate-pulse shrink-0" />
          <span>Local Sync Active</span>
        </span>

        {/* History Toggle */}
        {activeFile && (
          <button
            onClick={onOpenHistory}
            className={cn(
              "flex items-center gap-1 py-0.5 px-1.5 rounded hover:bg-[var(--theme-sidebar-active-bg)] hover:text-[var(--theme-sidebar-active-text)] transition-colors cursor-pointer",
              isHistoryOpen ? "bg-[var(--theme-accent)] text-white hover:bg-[var(--theme-accent)]" : ""
            )}
            title="Toggle Version History"
          >
            <History size={11} />
            <span>History</span>
          </button>
        )}

      </div>
    </footer>
  );
}
