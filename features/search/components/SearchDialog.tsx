"use client";

import React, { useState, useMemo } from "react";
import { useFileStore } from "../../../stores/useFileStore";
import { cn } from "../../../lib/utils";
import { Search, X, Replace, ReplaceAll, CaseSensitive, WholeWord, Binary, FileText } from "lucide-react";

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  fileId: string;
  fileName: string;
  line: number;
  text: string;
  index: number; // Index in content
}

export default function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const { files, updateFileContent, openTab } = useFileStore();

  const [query, setQuery] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [searchAll, setSearchAll] = useState(true);
  
  // Settings
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);

  // Compute matches reactively
  const results = useMemo((): SearchResult[] => {
    if (!query) return [];

    const searchResults: SearchResult[] = [];
    const targetFiles = searchAll ? files.filter(f => f.type === "file") : files.filter(f => f.type === "file" && f.id === useFileStore.getState().activeFileId);

    // Escape regex helpers
    const escapeRegExp = (string: string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };

    let regex: RegExp;
    try {
      let flags = "g";
      if (!caseSensitive) flags += "i";

      let pattern = query;
      if (!useRegex) {
        pattern = escapeRegExp(query);
      }
      if (wholeWord) {
        pattern = `\\b${pattern}\\b`;
      }

      regex = new RegExp(pattern, flags);
    } catch (e) {
      // Invalid regex pattern
      return [];
    }

    for (const file of targetFiles) {
      if (!file.content) continue;
      const lines = file.content.split("\n");
      
      lines.forEach((lineText, idx) => {
        // Reset regex index
        regex.lastIndex = 0;
        if (regex.test(lineText)) {
          searchResults.push({
            fileId: file.id,
            fileName: file.name,
            line: idx + 1,
            text: lineText,
            index: idx,
          });
        }
      });
    }

    return searchResults;
  }, [query, files, searchAll, caseSensitive, wholeWord, useRegex]);

  // Replacements
  const handleReplaceAll = () => {
    if (!query) return;

    const targetFiles = searchAll ? files.filter(f => f.type === "file") : files.filter(f => f.type === "file" && f.id === useFileStore.getState().activeFileId);

    const escapeRegExp = (string: string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };

    let regex: RegExp;
    try {
      let flags = "g";
      if (!caseSensitive) flags += "i";
      let pattern = query;
      if (!useRegex) pattern = escapeRegExp(query);
      if (wholeWord) pattern = `\\b${pattern}\\b`;
      regex = new RegExp(pattern, flags);
    } catch (e) {
      return;
    }

    for (const file of targetFiles) {
      if (!file.content) continue;
      const updatedContent = file.content.replace(regex, replaceText);
      if (updatedContent !== file.content) {
        updateFileContent(file.id, updatedContent);
      }
    }
  };

  const handleResultClick = (result: SearchResult) => {
    openTab(result.fileId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 select-none">
      
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-[#000]/60 backdrop-blur-sm" />

      {/* Dialog container */}
      <div className="relative w-full max-w-xl rounded-xl border border-[var(--theme-paper-border)]/20 bg-[var(--theme-editor-bg)] text-[var(--theme-editor-text)] shadow-2xl z-10 flex flex-col max-h-[75vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-[var(--theme-paper-border)]/15">
          <span className="text-sm font-serif font-semibold tracking-tight text-[var(--theme-sidebar-active-text)]">
            Search & Replace
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--theme-sidebar-active-bg)] text-[var(--theme-sidebar-text)]/60"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form controls */}
        <div className="p-4 space-y-3.5 border-b border-[var(--theme-paper-border)]/10 bg-[var(--theme-sidebar-bg)]/20">
          
          {/* Find row */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[var(--theme-paper-border)]/20 bg-[var(--theme-editor-bg)]">
              <Search size={15} className="text-[var(--theme-sidebar-text)]/40 shrink-0" />
              <input
                type="text"
                placeholder="Find..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-xs font-mono placeholder:text-[var(--theme-sidebar-text)]/30 text-[var(--theme-editor-text)]"
                autoFocus
              />
            </div>
            
            {/* Find filters */}
            <div className="flex rounded-lg border border-[var(--theme-paper-border)]/25 p-0.5">
              <button
                onClick={() => setCaseSensitive(!caseSensitive)}
                className={cn(
                  "p-1.5 rounded-md",
                  caseSensitive ? "bg-[var(--theme-accent)] text-white" : "text-[var(--theme-sidebar-text)] hover:text-[var(--theme-sidebar-active-text)]"
                )}
                title="Match Case"
              >
                <CaseSensitive size={14} />
              </button>
              <button
                onClick={() => setWholeWord(!wholeWord)}
                className={cn(
                  "p-1.5 rounded-md",
                  wholeWord ? "bg-[var(--theme-accent)] text-white" : "text-[var(--theme-sidebar-text)] hover:text-[var(--theme-sidebar-active-text)]"
                )}
                title="Whole Word"
              >
                <WholeWord size={14} />
              </button>
              <button
                onClick={() => setUseRegex(!useRegex)}
                className={cn(
                  "p-1.5 rounded-md",
                  useRegex ? "bg-[var(--theme-accent)] text-white" : "text-[var(--theme-sidebar-text)] hover:text-[var(--theme-sidebar-active-text)]"
                )}
                title="Regular Expression"
              >
                <Binary size={14} />
              </button>
            </div>
          </div>

          {/* Replace row */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[var(--theme-paper-border)]/20 bg-[var(--theme-editor-bg)]">
              <Replace size={15} className="text-[var(--theme-sidebar-text)]/40 shrink-0" />
              <input
                type="text"
                placeholder="Replace with..."
                value={replaceText}
                onChange={e => setReplaceText(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-xs font-mono placeholder:text-[var(--theme-sidebar-text)]/30 text-[var(--theme-editor-text)]"
              />
            </div>

            <button
              onClick={handleReplaceAll}
              disabled={!query}
              className="px-3 rounded-lg bg-[var(--theme-accent)] text-white hover:bg-[var(--theme-accent-soft)]/90 disabled:opacity-40 flex items-center gap-1.5 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <ReplaceAll size={14} />
              <span>Replace All</span>
            </button>
          </div>

          {/* Scope row */}
          <div className="flex items-center gap-3 text-xs text-[var(--theme-sidebar-text)] font-mono">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="search-scope"
                checked={searchAll}
                onChange={() => setSearchAll(true)}
                className="accent-[var(--theme-accent)]"
              />
              <span>All Documents</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="search-scope"
                checked={!searchAll}
                onChange={() => setSearchAll(false)}
                className="accent-[var(--theme-accent)]"
              />
              <span>Current Document</span>
            </label>
          </div>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-2 min-h-[150px] space-y-1 bg-[var(--theme-editor-bg)]/40">
          {query ? (
            results.length > 0 ? (
              results.map((result, idx) => (
                <div
                  key={`result-${idx}`}
                  onClick={() => handleResultClick(result)}
                  className="p-2 rounded-lg hover:bg-[var(--theme-sidebar-active-bg)]/40 cursor-pointer border border-transparent hover:border-[var(--theme-paper-border)]/10 text-xs font-mono group"
                >
                  <div className="flex items-center justify-between text-[10px] text-[var(--theme-sidebar-text)]/65 mb-1">
                    <span className="flex items-center gap-1 font-semibold text-[var(--theme-accent)]">
                      <FileText size={12} />
                      {result.fileName}
                    </span>
                    <span>Line {result.line}</span>
                  </div>
                  <div className="text-[var(--theme-editor-text)] truncate opacity-90 pl-3 border-l-2 border-[var(--theme-paper-border)]/20 group-hover:border-[var(--theme-accent)] transition-colors">
                    {result.text}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-[var(--theme-sidebar-text)]/40 italic font-mono">
                No matches found
              </div>
            )
          ) : (
            <div className="py-12 text-center text-xs text-[var(--theme-sidebar-text)]/30 font-mono">
              Enter a search query above to filter documents
            </div>
          )}
        </div>

        {/* Footer info */}
        {query && results.length > 0 && (
          <div className="px-4 py-2 border-t border-[var(--theme-paper-border)]/15 bg-[var(--theme-sidebar-bg)] text-[10px] font-mono text-[var(--theme-sidebar-text)]/60">
            Found {results.length} matches in {new Set(results.map(r => r.fileId)).size} documents
          </div>
        )}

      </div>
    </div>
  );
}
