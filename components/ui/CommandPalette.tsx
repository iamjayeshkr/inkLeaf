"use client";

import React, { useState, useEffect, useRef } from "react";
import { useFileStore } from "../../stores/useFileStore";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { useThemeStore } from "../../stores/useThemeStore";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Compass, Terminal, FileText, Settings, X } from "lucide-react";
import { cn } from "../../lib/utils";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
  onOpenThemes: () => void;
  onOpenPlugins: () => void;
  onExport: (format: string) => void;
  onImport: () => void;
  onOpenAbout?: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onOpenSearch,
  onOpenThemes,
  onOpenPlugins,
  onExport,
  onImport,
  onOpenAbout,
}: CommandPaletteProps) {
  const { files, openTab, createFile, createFolder } = useFileStore();
  const {
    editorConfig,
    updateEditorConfig,
    toggleSidebar,
    togglePreview,
    setThemeMode,
    setPanelSizes,
  } = useSettingsStore();
  
  const { customThemes, applyTheme } = useThemeStore();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Setup Hotkey bindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex(i => Math.min(filteredItems.length - 1, i + 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex(i => Math.max(0, i - 1));
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            filteredItems[selectedIndex].action();
          }
        } else if (e.key === "Escape") {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Base list of items
  const commandItems = [
    // File creations
    { category: "System", title: "New Markdown Note", icon: FileText, action: () => { createFile("Untitled.md", null); onClose(); } },
    { category: "System", title: "New Workspace Folder", icon: Compass, action: () => { createFolder("New Folder", null); onClose(); } },
    { category: "System", title: "Global Search & Replace", icon: Search, action: () => { onOpenSearch(); onClose(); } },
    { category: "System", title: "About Inkleaf Studio (Easter Egg)", icon: Compass, action: () => { if (onOpenAbout) onOpenAbout(); onClose(); } },
    
    // Editor preferences
    { category: "Editor", title: "Toggle Focus Mode", icon: Terminal, action: () => { updateEditorConfig({ focusMode: !editorConfig.focusMode }); onClose(); } },
    { category: "Editor", title: "Toggle Typewriter Scroll Mode", icon: Terminal, action: () => { updateEditorConfig({ typewriterMode: !editorConfig.typewriterMode }); onClose(); } },
    { category: "Editor", title: "Toggle Line Numbers", icon: Terminal, action: () => { updateEditorConfig({ lineNumbers: !editorConfig.lineNumbers }); onClose(); } },
    { category: "Editor", title: "Toggle Code Folding", icon: Terminal, action: () => { updateEditorConfig({ codeFolding: !editorConfig.codeFolding }); onClose(); } },
    { category: "Editor", title: "Toggle Word Wrap", icon: Terminal, action: () => { updateEditorConfig({ wordWrap: !editorConfig.wordWrap }); onClose(); } },
    { category: "Editor", title: "Reset Editor Font Size", icon: Terminal, action: () => { updateEditorConfig({ fontSize: 14 }); onClose(); } },
    
    // Panels
    { category: "Workspace", title: "Toggle Left Sidebar", icon: Settings, action: () => { toggleSidebar(); onClose(); } },
    { category: "Workspace", title: "Toggle Right Preview Pane", icon: Settings, action: () => { togglePreview(); onClose(); } },
    { category: "Workspace", title: "Reset Layout Panel Sizes (50/50)", icon: Settings, action: () => { setPanelSizes(260, 50); onClose(); } },
    
    // Theme presets
    { category: "Themes", title: "Switch Theme: Dark Mode", icon: Settings, action: () => { setThemeMode("dark"); applyTheme(null); onClose(); } },
    { category: "Themes", title: "Switch Theme: Light Mode", icon: Settings, action: () => { setThemeMode("light"); applyTheme(null); onClose(); } },
    { category: "Themes", title: "Switch Theme: Classic Sepia", icon: Settings, action: () => { setThemeMode("sepia"); onClose(); } },
    { category: "Themes", title: "Switch Theme: Nord Frost", icon: Settings, action: () => { setThemeMode("nord"); onClose(); } },
    { category: "Themes", title: "Switch Theme: Charcoal Dark", icon: Settings, action: () => { setThemeMode("charcoal"); onClose(); } },
    { category: "Themes", title: "Switch Theme: Rosé Pine", icon: Settings, action: () => { setThemeMode("rosepine"); onClose(); } },
    { category: "Themes", title: "Switch Theme: Sakura Bloom", icon: Settings, action: () => { setThemeMode("sakura"); onClose(); } },
    { category: "Themes", title: "Switch Theme: Espresso Warm", icon: Settings, action: () => { setThemeMode("espresso"); onClose(); } },
    { category: "Themes", title: "Switch Theme: Obsidian Steel (Corporate)", icon: Settings, action: () => { setThemeMode("corporate"); onClose(); } },
    { category: "Themes", title: "Switch Theme: Analog Paper", icon: Settings, action: () => { setThemeMode("paper"); onClose(); } },
    { category: "Themes", title: "Switch Theme: Apple Modern", icon: Settings, action: () => { setThemeMode("apple"); onClose(); } },
    { category: "Themes", title: "Switch Theme: Google Material", icon: Settings, action: () => { setThemeMode("google"); onClose(); } },
    { category: "Themes", title: "Switch Theme: Burger Feast", icon: Settings, action: () => { setThemeMode("burger"); onClose(); } },
    { category: "Themes", title: "Switch Theme: Creative Neon", icon: Settings, action: () => { setThemeMode("creative"); onClose(); } },
    { category: "Themes", title: "Open Theme variables customizer", icon: Settings, action: () => { onOpenThemes(); onClose(); } },
    
    // Plugins
    { category: "Plugins", title: "Open Plugins Manager & AI stubs", icon: Settings, action: () => { onOpenPlugins(); onClose(); } },

    // Actions
    { category: "Actions", title: "Import External Markdown/DOCX", icon: Settings, action: () => { onImport(); onClose(); } },
    { category: "Actions", title: "Export to Markdown File", icon: Settings, action: () => { onExport("markdown"); onClose(); } },
    { category: "Actions", title: "Export to Styled HTML Manuscript", icon: Settings, action: () => { onExport("html"); onClose(); } },
    { category: "Actions", title: "Export to Vector PDF Document", icon: Settings, action: () => { onExport("pdf"); onClose(); } },
    { category: "Actions", title: "Export to Word DOCX Document", icon: Settings, action: () => { onExport("docx"); onClose(); } },
    { category: "Actions", title: "Export Preview to Canvas Image (PNG)", icon: Settings, action: () => { onExport("png"); onClose(); } },
  ];

  // Append open files to palette
  const openFileItems = files
    .filter(f => f.type === "file")
    .map(f => ({
      category: "Documents",
      title: `Open document: ${f.name}`,
      icon: FileText,
      action: () => { openTab(f.id); onClose(); }
    }));

  const allItems = [...commandItems, ...openFileItems];

  const filteredItems = allItems.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#000]/60 backdrop-blur-sm"
          />

          {/* Dialog Body */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            className="relative w-full max-w-lg overflow-hidden rounded-xl border border-[var(--theme-paper-border)]/20 bg-[var(--theme-editor-bg)] text-[var(--theme-editor-text)] shadow-2xl z-10"
          >
            
            {/* Input Search header */}
            <div className="flex items-center gap-3 px-4 border-b border-[var(--theme-paper-border)]/15 py-3">
              <Search size={18} className="text-[var(--theme-sidebar-text)]/40 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a command or file name..."
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-[var(--theme-sidebar-text)]/40 font-mono text-[var(--theme-editor-text)]"
              />
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-[var(--theme-sidebar-active-bg)] text-[var(--theme-sidebar-text)]/60"
              >
                <X size={14} />
              </button>
            </div>

            {/* Suggestions list */}
            <div className="max-h-[320px] overflow-y-auto p-2 scrollbar-none space-y-0.5">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, idx) => {
                  const ItemIcon = item.icon;
                  const isSelected = idx === selectedIndex;

                  return (
                    <div
                      key={`cmd-${idx}`}
                      onClick={item.action}
                      onPointerOver={() => setSelectedIndex(idx)}
                      className={cn(
                        "flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer text-xs transition-colors",
                        isSelected
                          ? "bg-[var(--theme-accent)] text-white"
                          : "hover:bg-[var(--theme-sidebar-active-bg)]/40 text-[var(--theme-editor-text)]"
                      )}
                    >
                      <ItemIcon size={14} className="shrink-0" />
                      <span className="flex-1 font-mono">{item.title}</span>
                      <span
                        className={cn(
                          "text-[9px] uppercase tracking-wider font-semibold opacity-60 font-mono",
                          isSelected ? "text-white" : "text-[var(--theme-sidebar-text)]"
                        )}
                      >
                        {item.category}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-[var(--theme-sidebar-text)]/40 italic font-mono">
                  No matching commands or files found
                </div>
              )}
            </div>

            {/* Footer indicators */}
            <div className="px-4 py-2 border-t border-[var(--theme-paper-border)]/15 bg-[var(--theme-sidebar-bg)] flex justify-between items-center text-[9px] font-mono text-[var(--theme-sidebar-text)]/50">
              <div className="flex gap-3">
                <span>↑↓ Navigate</span>
                <span>Enter Execute</span>
              </div>
              <span>ESC Close</span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
