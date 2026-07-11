"use client";

import React, { useEffect, useState, useRef } from "react";
import { useFileStore } from "../stores/useFileStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import { useThemeStore, THEME_PRESETS } from "../stores/useThemeStore";
import { usePluginStore } from "../stores/usePluginStore";
import ResizablePanels from "../components/layout/ResizablePanels";
import Sidebar from "../components/layout/Sidebar";
import TopNav from "../components/layout/TopNav";
import StatusBar from "../components/layout/StatusBar";
import MarkdownEditor from "../features/editor/components/MarkdownEditor";
import FormattingToolbar from "../features/editor/components/FormattingToolbar";
import MarkdownPreview from "../features/preview/components/MarkdownPreview";
import PresentationMode from "../features/preview/components/PresentationMode";
import CommandPalette from "../components/ui/CommandPalette";
import SearchDialog from "../features/search/components/SearchDialog";
import ThemeEditor from "../features/themes/components/ThemeEditor";
import PluginManager from "../features/plugins/components/PluginManager";
import AboutDialog from "../components/ui/AboutDialog";
import VersionHistory from "../features/history/components/VersionHistory";
import AuthWrapper from "../components/auth/AuthWrapper";
import { FileImporter } from "../lib/importers";
import { FileExporter } from "../lib/exporters";
import { X, Eye } from "lucide-react";
import { cn } from "../lib/utils";

export const dynamic = "force-dynamic";

export default function Page() {
  const {
    files,
    activeFileId,
    createFile,
    init: initFiles,
  } = useFileStore();

  const {
    editorConfig,
    previewConfig,
    sidebarCollapsed,
    previewCollapsed,
    themeMode,
    activeCustomThemeId,
    sidebarWidth,
    initSettings,
    updatePreviewConfig,
    togglePreview,
    toggleSidebar,
  } = useSettingsStore();

  const { activeTheme, initThemes, applyTheme, customThemes } = useThemeStore();
  const { initPlugins } = usePluginStore();

  const activeFile = files.find(f => f.id === activeFileId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hydration state
  const [isMounted, setIsMounted] = useState(false);

  // Modal Open states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isThemesOpen, setIsThemesOpen] = useState(false);
  const [isPluginsOpen, setIsPluginsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Initialize all stores
  useEffect(() => {
    const initializeApp = async () => {
      await initFiles();
      await initSettings();
      
      const currentSettings = useSettingsStore.getState();

      // Auto-collapse sidebar on mobile
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        if (!currentSettings.sidebarCollapsed) {
          await currentSettings.toggleSidebar();
        }
      }

      await initThemes(currentSettings.themeMode, currentSettings.activeCustomThemeId);
      await initPlugins();

      // Register PWA service worker
      if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
        try {
          await navigator.serviceWorker.register("/sw.js");
        } catch (err) {
          console.error("ServiceWorker registration failed:", err);
        }
      }

      setIsMounted(true);
    };

    initializeApp();
  }, [initFiles, initSettings, initThemes, initPlugins]);

  // Synchronize applied theme with themeMode configuration
  useEffect(() => {
    if (themeMode === "custom" && activeCustomThemeId) {
      const customTheme = customThemes.find(t => t.id === activeCustomThemeId);
      if (customTheme) {
        applyTheme(customTheme);
      }
    } else if (themeMode !== "custom" && THEME_PRESETS[themeMode]) {
      applyTheme(THEME_PRESETS[themeMode]);
    } else {
      applyTheme(null);
    }
  }, [themeMode, activeCustomThemeId, customThemes, applyTheme]);

  // Handle light/dark CSS class toggling
  useEffect(() => {
    const checkDark = () => {
      if (themeMode === "dark") return true;
      if (themeMode === "system") {
        return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      if (themeMode === "custom" && activeTheme) {
        return activeTheme.isDark;
      }
      if (THEME_PRESETS[themeMode]) {
        return THEME_PRESETS[themeMode].isDark;
      }
      return false;
    };

    const isDark = checkDark();
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    document.documentElement.setAttribute("data-theme", themeMode);
  }, [themeMode, activeTheme]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Command Palette: Cmd + K / Ctrl + K or Cmd + Shift + P
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K" || e.key === "p" || e.key === "P")) {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }

      // 2. Global Search: Cmd + Shift + F / Ctrl + Shift + F
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === "f" || e.key === "F")) {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }

      // 3. Toggle Preview: Ctrl + /
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        togglePreview();
      }

      // 5. Secret About Us Dialog shortcut: Cmd + Shift + A / Ctrl + Shift + A (Easter Egg)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === "a" || e.key === "A")) {
        e.preventDefault();
        setIsAboutOpen(prev => !prev);
      }

      // 4. Escape: Close any open overlay
      if (e.key === "Escape") {
        setIsCommandPaletteOpen(false);
        setIsSearchOpen(false);
        setIsThemesOpen(false);
        setIsPluginsOpen(false);
        setIsHistoryOpen(false);
        setIsAboutOpen(false);
        updatePreviewConfig({ readingMode: false, presentationMode: false });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePreview, updatePreviewConfig]);

  // Import file triggers
  const handleTriggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await FileImporter.readTextFile(file);
      const fileName = file.name;

      if (fileName.endsWith(".json")) {
        const restoredFiles = FileImporter.parseWorkspaceJson(text);
        if (confirm("Restore workspace backup? This will load the backup folders and notes.")) {
          // Sync database bulk import
          const { db } = await import("../lib/db");
          await db.saveFilesBulk(restoredFiles);
          window.location.reload();
        }
      } else if (fileName.endsWith(".html") || fileName.endsWith(".htm")) {
        const markdown = FileImporter.htmlToMarkdown(text);
        await createFile(fileName.replace(/\.html?$/i, ""), null, markdown);
      } else {
        // Default treat as markdown text
        await createFile(fileName.replace(/\.md$/i, ""), null, text);
      }
    } catch (err: any) {
      alert(err.message || "Failed to import selected file.");
    } finally {
      e.target.value = "";
    }
  };

  // Export Document Triggers
  const handleTriggerExport = (format: string) => {
    if (!activeFile) return;

    const name = activeFile.name;
    const content = activeFile.content || "";

    switch (format) {
      case "markdown":
        FileExporter.exportMarkdown(name, content);
        break;
      case "html":
        FileExporter.exportHtml(name, content);
        break;
      case "docx":
        FileExporter.exportDocx(name, content);
        break;
      case "pdf":
        FileExporter.exportPdf();
        break;
      case "png":
        FileExporter.exportPng(name);
        break;
      case "json":
        FileExporter.exportJson(name + "-workspace-backup", files);
        break;
      default:
        break;
    }
  };

  // Hydration guard
  if (!isMounted) {
    return <div className="min-h-screen bg-[#05070A]" />;
  }

  return (
    <AuthWrapper>
      {previewConfig.presentationMode ? (
        <PresentationMode />
      ) : previewConfig.readingMode ? (
        <main className="fixed inset-0 z-40 bg-[var(--theme-paper-bg)] text-[var(--theme-paper-text)] overflow-hidden flex flex-col">
          {/* Floating Close HUD */}
          <div className="absolute top-4 right-6 z-50 flex items-center gap-2">
            <button
              onClick={() => updatePreviewConfig({ readingMode: false })}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--theme-sidebar-bg)] border border-[var(--theme-paper-border)]/20 shadow-sm text-xs font-mono text-[var(--theme-sidebar-text)] hover:text-[var(--theme-sidebar-active-text)] transition-colors cursor-pointer"
            >
              <X size={13} />
              <span>Close Reading Pane</span>
            </button>
          </div>

          {/* Scrollable single reader container */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto h-full">
              <MarkdownPreview />
            </div>
          </div>
        </main>
      ) : (
        <main className="flex h-screen flex-col overflow-hidden bg-[var(--theme-bg)] text-[var(--theme-text)]">
          
          {/* 1. Top Header Nav bar */}
          <TopNav
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenThemeEditor={() => setIsThemesOpen(true)}
            onOpenPluginManager={() => setIsPluginsOpen(true)}
            onTriggerExport={handleTriggerExport}
            onTriggerImport={handleTriggerImport}
            onOpenAbout={() => setIsAboutOpen(true)}
          />

          {/* Invisible file upload trigger */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,.txt,.html,.json"
            className="hidden"
            onChange={handleImportFileChange}
          />

          {/* 2. Central Workspace layout */}
          <div className="flex-1 min-h-0 relative">
            <ResizablePanels
              sidebar={<Sidebar onOpenThemeEditor={() => setIsThemesOpen(true)} onOpenAbout={() => setIsAboutOpen(true)} />}
              editor={
                <div className="flex flex-col h-full overflow-hidden">
                  <FormattingToolbar />
                  <div className="flex-1 min-h-0">
                    <MarkdownEditor />
                  </div>
                </div>
              }
              preview={<MarkdownPreview />}
            />

            {/* Floating Version history drawer */}
            <VersionHistory
              isOpen={isHistoryOpen}
              onClose={() => setIsHistoryOpen(false)}
            />
          </div>

          {/* 3. Bottom status metrics bar */}
          <StatusBar
            onOpenHistory={() => setIsHistoryOpen(prev => !prev)}
            isHistoryOpen={isHistoryOpen}
          />

          {/* 4. Overlay spotlight controls */}
          <CommandPalette
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenThemes={() => setIsThemesOpen(true)}
            onOpenPlugins={() => setIsPluginsOpen(true)}
            onExport={handleTriggerExport}
            onImport={handleTriggerImport}
            onOpenAbout={() => setIsAboutOpen(true)}
          />

          <SearchDialog
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
          />

          <ThemeEditor
            isOpen={isThemesOpen}
            onClose={() => setIsThemesOpen(false)}
          />

          <PluginManager
            isOpen={isPluginsOpen}
            onClose={() => setIsPluginsOpen(false)}
          />

          <AboutDialog
            isOpen={isAboutOpen}
            onClose={() => setIsAboutOpen(false)}
          />

        </main>
      )}
    </AuthWrapper>
  );
}

// Trigger recompile: 1
