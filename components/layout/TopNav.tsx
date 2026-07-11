"use client";

import React, { useRef, useState, useEffect } from "react";
import { useFileStore } from "../../stores/useFileStore";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { cn } from "../../lib/utils";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Menu,
  X,
  Pin,
  Search,
  Download,
  Upload,
  Sparkles,
  Palette,
  Play,
  BookOpen,
  Eye,
  EyeOff,
  ChevronDown,
  ExternalLink,
  HelpCircle,
  Type,
} from "lucide-react";

interface TopNavProps {
  onOpenSearch: () => void;
  onOpenThemeEditor: () => void;
  onOpenPluginManager: () => void;
  onTriggerExport: (format: string) => void;
  onTriggerImport: () => void;
  onOpenAbout: () => void;
}

export default function TopNav({
  onOpenSearch,
  onOpenThemeEditor,
  onOpenPluginManager,
  onTriggerExport,
  onTriggerImport,
  onOpenAbout,
}: TopNavProps) {
  const {
    files,
    activeFileId,
    openTabs,
    pinnedTabs,
    setActiveFileId,
    closeTab,
    togglePinTab,
    renameNode,
  } = useFileStore();

  const {
    sidebarCollapsed,
    toggleSidebar,
    previewCollapsed,
    togglePreview,
    previewConfig,
    updatePreviewConfig,
  } = useSettingsStore();

  const activeFile = files.find(f => f.id === activeFileId);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [localName, setLocalName] = useState("");

  // Sync local state when active document or its name changes elsewhere
  useEffect(() => {
    if (activeFile) {
      setLocalName(activeFile.name);
    } else {
      setLocalName("");
    }
  }, [activeFileId, activeFile?.name]);

  const handleTabClick = (id: string) => {
    setActiveFileId(id);
  };

  const commitRename = async () => {
    if (activeFileId && localName.trim() && localName.trim() !== activeFile?.name) {
      await renameNode(activeFileId, localName.trim());
    } else if (activeFile) {
      // Revert local input back to original if left empty
      setLocalName(activeFile.name);
    }
  };

  return (
    <header className="flex flex-none flex-col bg-[var(--theme-sidebar-bg)] text-[var(--theme-sidebar-text)] z-30 select-none">
      
      {/* Top action row */}
      <div className="flex h-11 items-center gap-3 px-4">
        
        {/* Toggle sidebar button */}
        {sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="p-1 rounded hover:bg-[var(--theme-sidebar-active-bg)]/40 text-[var(--theme-sidebar-text)] transition-colors cursor-pointer"
            title="Expand sidebar"
          >
            <Menu size={16} />
          </button>
        )}

        {/* File Name Title Input */}
        {activeFile ? (
          <div className="flex items-center gap-1.5 min-w-0 max-w-[200px] sm:max-w-xs md:max-w-md">
            <input
              type="text"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  commitRename();
                  e.currentTarget.blur();
                } else if (e.key === "Escape") {
                  setLocalName(activeFile.name);
                  e.currentTarget.blur();
                }
              }}
              spellCheck={false}
              className="bg-transparent text-sm font-semibold text-[var(--theme-sidebar-active-text)] focus:outline-none min-w-0 truncate py-0.5 px-1 hover:bg-[var(--theme-sidebar-active-bg)]/20 rounded focus:bg-[var(--theme-editor-bg)] focus:ring-1 focus:ring-[var(--theme-accent)]"
              placeholder="untitled"
            />
          </div>
        ) : (
          <span className="text-xs text-[var(--theme-sidebar-text)]/40 italic">
            No document open
          </span>
        )}

        {/* Right Toolbar Actions */}
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          
          {/* 1. Global Search */}
          <button
            onClick={onOpenSearch}
            className="p-1.5 rounded hover:bg-[var(--theme-sidebar-active-bg)]/40 text-[var(--theme-sidebar-text)] hover:text-[var(--theme-sidebar-active-text)] transition-colors cursor-pointer"
            title="Search & Replace (Ctrl+Shift+F)"
          >
            <Search size={15} />
          </button>

          {/* 2. File Importer */}
          <button
            onClick={onTriggerImport}
            className="p-1.5 rounded hover:bg-[var(--theme-sidebar-active-bg)]/40 text-[var(--theme-sidebar-text)] hover:text-[var(--theme-sidebar-active-text)] transition-colors cursor-pointer flex items-center gap-1 text-xs"
            title="Import Markdown/DOCX/HTML"
          >
            <Upload size={15} />
            <span className="hidden md:inline font-medium">Import</span>
          </button>

          {/* 3. Export Dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                disabled={!activeFileId}
                className="p-1.5 rounded hover:bg-[var(--theme-sidebar-active-bg)]/40 text-[var(--theme-sidebar-text)] hover:text-[var(--theme-sidebar-active-text)] transition-colors disabled:opacity-30 cursor-pointer flex items-center gap-1 text-xs"
                title="Export document"
              >
                <Download size={15} />
                <span className="hidden md:inline font-medium">Export</span>
                <ChevronDown size={12} className="opacity-60" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[150px] rounded-lg border border-[var(--theme-paper-border)] bg-[var(--theme-editor-bg)] text-[var(--theme-editor-text)] p-1 shadow-lg animate-in fade-in zoom-in duration-100"
                align="end"
                sideOffset={5}
              >
                {[
                  { label: "Markdown (.md)", format: "markdown" },
                  { label: "Styled HTML (.html)", format: "html" },
                  { label: "Manuscript PDF (.pdf)", format: "pdf" },
                  { label: "Word Document (.docx)", format: "docx" },
                  { label: "Canvas Image (.png)", format: "png" },
                  { label: "JSON Backup (.json)", format: "json" },
                ].map(format => (
                  <DropdownMenu.Item
                    key={format.format}
                    onSelect={() => onTriggerExport(format.format)}
                    className="flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-[var(--theme-accent)] hover:text-white cursor-pointer outline-none font-medium"
                  >
                    {format.label}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <span className="h-4 w-px bg-transparent mx-1 hidden md:inline" />

          {/* 4. Plugin manager */}
          <button
            onClick={onOpenPluginManager}
            className="p-1.5 rounded hover:bg-[var(--theme-sidebar-active-bg)]/40 text-[var(--theme-sidebar-text)] hover:text-[var(--theme-sidebar-active-text)] transition-colors cursor-pointer hidden md:inline-flex"
            title="AI Settings & Plugins"
          >
            <Sparkles size={15} className="text-purple-400" />
          </button>

          {/* 5. Theme Customizer */}
          <button
            onClick={onOpenThemeEditor}
            className="p-1.5 rounded hover:bg-[var(--theme-sidebar-active-bg)]/40 text-[var(--theme-sidebar-text)] hover:text-[var(--theme-sidebar-active-text)] transition-colors cursor-pointer hidden md:inline-flex"
            title="Create Custom Theme"
          >
            <Palette size={15} />
          </button>

          {/* Help & About */}
          <button
            onClick={onOpenAbout}
            className="p-1.5 rounded hover:bg-[var(--theme-sidebar-active-bg)]/40 text-[var(--theme-sidebar-text)] hover:text-[var(--theme-sidebar-active-text)] transition-colors cursor-pointer hidden md:inline-flex"
            title="About Inkleaf"
          >
            <HelpCircle size={15} />
          </button>

          {/* Typography Style Selector */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="p-1.5 rounded hover:bg-[var(--theme-sidebar-active-bg)]/40 text-[var(--theme-sidebar-text)] hover:text-[var(--theme-sidebar-active-text)] transition-colors cursor-pointer hidden md:inline-flex items-center gap-0.5"
                title="Visual Font Style"
              >
                <Type size={15} />
                <ChevronDown size={11} className="opacity-60" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[140px] rounded-lg border-0 bg-[var(--theme-editor-bg)] text-[var(--theme-editor-text)] p-1 shadow-lg animate-in fade-in zoom-in duration-100"
                align="center"
                sideOffset={5}
              >
                {[
                  { label: "📖 Editorial Serif", font: "serif" as const },
                  { label: "✍️ Handwriting", font: "handwriting" as const },
                  { label: "💻 Modern Sans", font: "sans" as const },
                  { label: "📝 Technical Mono", font: "mono" as const },
                ].map(item => (
                  <DropdownMenu.Item
                    key={item.font}
                    onSelect={() => updatePreviewConfig({ previewFont: item.font })}
                    className={cn(
                      "flex items-center justify-between px-2 py-1.5 text-xs rounded hover:bg-[var(--theme-accent)] hover:text-white cursor-pointer outline-none font-medium",
                      (previewConfig.previewFont || "sans") === item.font ? "bg-[var(--theme-sidebar-active-bg)]/40 font-semibold" : ""
                    )}
                  >
                    <span>{item.label}</span>
                    {(previewConfig.previewFont || "sans") === item.font && (
                      <span className="text-[10px] opacity-70">✓</span>
                    )}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <span className="h-4 w-px bg-transparent mx-1 hidden md:inline" />

          {/* 6. View toggles */}
          <button
            onClick={() => updatePreviewConfig({ readingMode: !previewConfig.readingMode })}
            className={cn(
              "p-1.5 rounded hover:bg-[var(--theme-sidebar-active-bg)]/40 text-[var(--theme-sidebar-text)] hover:text-[var(--theme-sidebar-active-text)] transition-colors cursor-pointer hidden md:inline-flex",
              previewConfig.readingMode ? "bg-[var(--theme-accent)] text-white" : ""
            )}
            title="Reading Mode"
          >
            <BookOpen size={15} />
          </button>

          <button
            onClick={() => updatePreviewConfig({ presentationMode: !previewConfig.presentationMode })}
            className={cn(
              "p-1.5 rounded hover:bg-[var(--theme-sidebar-active-bg)]/40 text-[var(--theme-sidebar-text)] hover:text-[var(--theme-sidebar-active-text)] transition-colors cursor-pointer hidden md:inline-flex",
              previewConfig.presentationMode ? "bg-[var(--theme-accent)] text-white" : ""
            )}
            title="Presentation Slides Mode"
          >
            <Play size={15} />
          </button>

          <button
            onClick={togglePreview}
            className={cn(
              "p-1.5 rounded hover:bg-[var(--theme-sidebar-active-bg)]/40 text-[var(--theme-sidebar-text)] hover:text-[var(--theme-sidebar-active-text)] transition-colors cursor-pointer hidden md:inline-flex",
              previewCollapsed ? "text-[var(--theme-sidebar-text)]/40" : ""
            )}
            title={previewCollapsed ? "Show preview pane (Ctrl+/)" : "Hide preview pane (Ctrl+/)"}
          >
            {previewCollapsed ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>

        </div>
      </div>

      {/* Tabs Row */}
      {openTabs.length > 0 && (
        <div className="flex h-9 items-center bg-[var(--theme-sidebar-bg)] px-2 overflow-hidden">
          <div
            ref={scrollContainerRef}
            className="flex-1 flex gap-1 items-center overflow-x-auto h-full pr-4 scrollbar-none"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {/* Render pinned tabs first */}
            {pinnedTabs.map(id => {
              const file = files.find(f => f.id === id);
              if (!file) return null;
              const isActive = activeFileId === id;

              return (
                <div
                  key={`pinned-${id}`}
                  onClick={() => handleTabClick(id)}
                  className={cn(
                    "flex items-center gap-1.5 h-[28px] px-2.5 rounded-md cursor-pointer text-xs transition-colors shrink-0 group",
                    isActive
                      ? "bg-[var(--theme-editor-bg)] text-[var(--theme-sidebar-active-text)] font-semibold shadow-sm"
                      : "hover:bg-[var(--theme-sidebar-active-bg)]/30 text-[var(--theme-sidebar-text)]"
                  )}
                  title={`Pinned: ${file.name}`}
                >
                  <Pin size={11} className="text-[var(--theme-accent)] shrink-0" />
                  <span className="max-w-[70px] truncate">{file.name}</span>
                  
                  {/* Pin toggle / Close alternative via dropdown */}
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button
                        onClick={e => e.stopPropagation()}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[var(--theme-sidebar-active-bg)] text-[var(--theme-sidebar-text)]/60 transition-opacity"
                      >
                        <ChevronDown size={10} />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        className="z-50 min-w-[100px] rounded-lg border border-[var(--theme-paper-border)] bg-[var(--theme-editor-bg)] text-[var(--theme-editor-text)] p-1 shadow-lg text-xs"
                        align="start"
                      >
                        <DropdownMenu.Item
                          onSelect={() => togglePinTab(id)}
                          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[var(--theme-accent)] hover:text-white cursor-pointer outline-none"
                        >
                          Unpin Tab
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              );
            })}

            {/* Render standard tabs */}
            {openTabs
              .filter(id => !pinnedTabs.includes(id))
              .map(id => {
                const file = files.find(f => f.id === id);
                if (!file) return null;
                const isActive = activeFileId === id;

                return (
                  <div
                    key={`tab-${id}`}
                    onClick={() => handleTabClick(id)}
                    className={cn(
                      "flex items-center gap-2 h-[28px] pl-3 pr-1.5 rounded-md cursor-pointer text-xs transition-colors shrink-0 group relative",
                      isActive
                        ? "bg-[var(--theme-editor-bg)] text-[var(--theme-sidebar-active-text)] font-semibold shadow-sm"
                        : "hover:bg-[var(--theme-sidebar-active-bg)]/30 text-[var(--theme-sidebar-text)]"
                    )}
                  >
                    <span className="max-w-[120px] truncate">{file.name}</span>
                    
                    {/* Tab options / Close button */}
                    <div className="flex items-center">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          togglePinTab(id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[var(--theme-sidebar-active-bg)] text-[var(--theme-sidebar-text)]/50 mr-0.5 hover:text-[var(--theme-accent)] transition-opacity"
                        title="Pin tab"
                      >
                        <Pin size={10} />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          closeTab(id);
                        }}
                        className="p-0.5 rounded hover:bg-red-500/20 text-[var(--theme-sidebar-text)]/60 hover:text-red-500 transition-colors"
                        title="Close tab"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </header>
  );
}
