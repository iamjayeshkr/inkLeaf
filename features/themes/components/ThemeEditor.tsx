"use client";

import React, { useState } from "react";
import { useThemeStore, THEME_PRESETS } from "../../../stores/useThemeStore";
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { CustomTheme } from "../../../types";
import { cn } from "../../../lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { X, Palette, Plus, Trash2, Download, Upload, Check } from "lucide-react";

interface ThemeEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_LIGHT_COLORS = {
  bg: "#FBF8F1",
  text: "#202124",
  sidebarBg: "#F3EEE2",
  sidebarText: "#5f6368",
  sidebarActiveBg: "#e8eaed",
  sidebarActiveText: "#202124",
  editorBg: "#FFFFFF",
  editorText: "#202124",
  editorCursor: "#3D5AFE",
  editorLineNumbers: "#9aa0a6",
  paperBg: "#FFFFFF",
  paperText: "#1A1A1A",
  paperBorder: "#dadce0",
  accent: "#3D5AFE",
  accentSoft: "rgba(61, 90, 254, 0.1)",
  gold: "#C9A227",
};

const DEFAULT_DARK_COLORS = {
  bg: "#0B0D12",
  text: "#e4e6ea",
  sidebarBg: "#11151e",
  sidebarText: "#8b92a3",
  sidebarActiveBg: "#181d28",
  sidebarActiveText: "#e4e6ea",
  editorBg: "#0B0D12",
  editorText: "#e4e6ea",
  editorCursor: "#c9a227",
  editorLineNumbers: "#3a4152",
  paperBg: "#181c25",
  paperText: "#FFFFFF",
  paperBorder: "#242b3a",
  accent: "#8ab4f8",
  accentSoft: "rgba(138, 180, 248, 0.15)",
  gold: "#c9a227",
};

export default function ThemeEditor({ isOpen, onClose }: ThemeEditorProps) {
  const {
    customThemes,
    activeTheme,
    createTheme,
    updateTheme,
    deleteTheme,
    applyTheme,
    importTheme,
    exportTheme,
  } = useThemeStore();

  const { themeMode, setThemeMode } = useSettingsStore();

  const [themeName, setThemeName] = useState("My Custom Theme");
  const [isDark, setIsDark] = useState(true);
  const [colors, setColors] = useState<CustomTheme["colors"]>(DEFAULT_DARK_COLORS);
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);
  const [importJson, setImportJson] = useState("");
  const [showImport, setShowImport] = useState(false);

  const handleColorChange = (key: keyof CustomTheme["colors"], value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!themeName.trim()) return;

    if (editingThemeId) {
      await updateTheme(editingThemeId, {
        name: themeName,
        isDark,
        colors,
      });
      setEditingThemeId(null);
    } else {
      const newId = await createTheme({
        name: themeName,
        isDark,
        colors,
      });
      setThemeMode("custom", newId);
    }

    setThemeName("My Custom Theme");
    setColors(isDark ? DEFAULT_DARK_COLORS : DEFAULT_LIGHT_COLORS);
  };

  const handleEditSelect = (theme: CustomTheme) => {
    setEditingThemeId(theme.id);
    setThemeName(theme.name);
    setIsDark(theme.isDark);
    setColors(theme.colors);
  };

  const handleImport = async () => {
    try {
      const id = await importTheme(importJson);
      setThemeMode("custom", id);
      setShowImport(false);
      setImportJson("");
      alert("Theme imported successfully!");
    } catch (e: any) {
      alert(e.message || "Failed to import theme.");
    }
  };

  const handleExport = (id: string) => {
    try {
      const json = exportTheme(id);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${id}-theme.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Failed to export theme");
    }
  };

  const presetsList = [
    { key: "light", name: "Light Mode", isDark: false, colors: { bg: "#FBF8F1", sidebarBg: "#F3EEE2", editorBg: "#FFFFFF", accent: "#3D5AFE" } },
    { key: "dark", name: "Dark Mode", isDark: true, colors: { bg: "#0B0D12", sidebarBg: "#181D28", editorBg: "#0B0D12", accent: "#3D5AFE" } },
    { key: "sepia", name: "Classic Sepia", isDark: false, colors: THEME_PRESETS.sepia.colors },
    { key: "nord", name: "Nord Frost", isDark: true, colors: THEME_PRESETS.nord.colors },
    { key: "charcoal", name: "Charcoal Dark", isDark: true, colors: THEME_PRESETS.charcoal.colors },
    { key: "rosepine", name: "Rosé Pine", isDark: true, colors: THEME_PRESETS.rosepine.colors },
    { key: "sakura", name: "Sakura Bloom", isDark: false, colors: THEME_PRESETS.sakura.colors },
    { key: "espresso", name: "Espresso Warm", isDark: true, colors: THEME_PRESETS.espresso.colors },
    { key: "corporate", name: "Obsidian Steel", isDark: true, colors: THEME_PRESETS.corporate.colors },
    { key: "paper", name: "Analog Paper", isDark: false, colors: THEME_PRESETS.paper.colors },
    { key: "apple", name: "Apple Modern", isDark: false, colors: THEME_PRESETS.apple.colors },
    { key: "google", name: "Google Material", isDark: false, colors: THEME_PRESETS.google.colors },
    { key: "burger", name: "Burger Feast", isDark: false, colors: THEME_PRESETS.burger.colors },
    { key: "creative", name: "Creative Neon", isDark: true, colors: THEME_PRESETS.creative.colors },
  ];

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200" />

        {/* Content Container - Cute, Small, Minimalist Box (max-w-sm / 384px) */}
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[78vh] w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 transform rounded-2xl bg-[var(--theme-editor-bg)] text-[var(--theme-editor-text)] p-4 shadow-2xl select-none flex flex-col gap-3 focus:outline-none animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex justify-between items-center pb-2">
            <Dialog.Title className="flex items-center gap-1.5 font-serif text-[14px] font-bold text-[var(--theme-sidebar-active-text)]">
              <Palette size={14} className="text-[var(--theme-accent)]" />
              Theme Studio
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 rounded-md hover:bg-[var(--theme-sidebar-active-bg)] text-[var(--theme-sidebar-text)]/60 hover:text-[var(--theme-sidebar-active-text)] transition-colors cursor-pointer">
                <X size={13} />
              </button>
            </Dialog.Close>
            <Dialog.Description asChild>
              <span className="sr-only">Switch theme presets or customize colors.</span>
            </Dialog.Description>
          </div>

          {/* Radix tabs for Presets Gallery vs Custom Studio */}
          <Tabs.Root defaultValue="gallery" className="flex flex-col flex-1 min-h-0">
            <Tabs.List className="flex gap-1 bg-[var(--theme-sidebar-bg)] p-0.5 rounded-lg text-[11px] font-mono font-semibold text-[var(--theme-sidebar-text)] mb-3 shrink-0">
              <Tabs.Trigger
                value="gallery"
                className="flex-1 px-2.5 py-1 rounded-md data-[state=active]:bg-[var(--theme-editor-bg)] data-[state=active]:text-[var(--theme-sidebar-active-text)] data-[state=active]:shadow-xs outline-none cursor-pointer transition-all text-center"
              >
                Gallery
              </Tabs.Trigger>
              <Tabs.Trigger
                value="custom"
                className="flex-1 px-2.5 py-1 rounded-md data-[state=active]:bg-[var(--theme-editor-bg)] data-[state=active]:text-[var(--theme-sidebar-active-text)] data-[state=active]:shadow-xs outline-none cursor-pointer transition-all text-center"
              >
                Customizer
              </Tabs.Trigger>
            </Tabs.List>

            {/* TAB 1: Gallery - Sleek list with maximum scroll view */}
            <Tabs.Content value="gallery" className="outline-none flex-1 overflow-y-auto pr-0.5 max-h-[320px] space-y-1">
              {presetsList.map(preset => (
                <div
                  key={preset.key}
                  onClick={() => {
                    setThemeMode(preset.key as any);
                    if (preset.key !== "custom") {
                      applyTheme(THEME_PRESETS[preset.key] || null);
                    }
                  }}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-between select-none text-xs",
                    themeMode === preset.key
                      ? "bg-[var(--theme-sidebar-active-bg)]/35 font-medium"
                      : "bg-[var(--theme-sidebar-bg)]/25 hover:bg-[var(--theme-sidebar-active-bg)]/25"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Compact Color Dots Preview */}
                    <div className="flex gap-0.5 bg-black/5 dark:bg-white/5 p-0.5 rounded shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.colors.bg }} />
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.colors.sidebarBg }} />
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.colors.editorBg }} />
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.colors.accent }} />
                    </div>
                    <span className="text-[11.5px] font-sans text-[var(--theme-sidebar-active-text)]">{preset.name}</span>
                  </div>
                  {themeMode === preset.key && (
                    <Check size={11} className="text-[var(--theme-accent)] shrink-0" />
                  )}
                </div>
              ))}
            </Tabs.Content>

            {/* TAB 2: Custom theme studio */}
            <Tabs.Content value="custom" className="outline-none flex-1 overflow-y-auto pr-0.5 space-y-3 max-h-[320px]">
              
              {/* Creator Customizer Form */}
              <div className="space-y-2.5 p-3 rounded-lg bg-[var(--theme-sidebar-bg)]/15">
                {/* Theme name & mode */}
                <div className="space-y-1">
                  <label className="block text-[8px] uppercase tracking-wider text-[var(--theme-sidebar-text)] font-mono font-bold">Theme Name</label>
                  <input
                    type="text"
                    value={themeName}
                    onChange={e => setThemeName(e.target.value)}
                    className="w-full bg-[var(--theme-sidebar-bg)] border-none px-2 py-1 rounded text-xs outline-none focus:ring-1 focus:ring-[var(--theme-accent)] text-[var(--theme-editor-text)]"
                    placeholder="E.g., Minty Fresh"
                  />
                </div>

                <label className="flex items-center justify-between text-[11px] font-semibold text-[var(--theme-sidebar-text)] cursor-pointer">
                  <span>Dark style</span>
                  <input
                    type="checkbox"
                    checked={isDark}
                    onChange={e => {
                      const val = e.target.checked;
                      setIsDark(val);
                      setColors(val ? DEFAULT_DARK_COLORS : DEFAULT_LIGHT_COLORS);
                    }}
                    className="accent-[var(--theme-accent)]"
                  />
                </label>

                {/* Grid of Color Pickers - Scrollable list */}
                <div className="space-y-1">
                  <label className="block text-[8px] uppercase tracking-wider text-[var(--theme-sidebar-text)] font-mono font-bold font-semibold">Variables</label>
                  <div className="grid grid-cols-2 gap-1 max-h-[100px] overflow-y-auto pr-0.5 p-1 rounded bg-[var(--theme-sidebar-bg)]/30">
                    {[
                      { label: "App BG", key: "bg" as const },
                      { label: "App Text", key: "text" as const },
                      { label: "Sidebar BG", key: "sidebarBg" as const },
                      { label: "Sidebar Text", key: "sidebarText" as const },
                      { label: "Editor BG", key: "editorBg" as const },
                      { label: "Editor Text", key: "editorText" as const },
                      { label: "Editor Caret", key: "editorCursor" as const },
                      { label: "Line Numbers", key: "editorLineNumbers" as const },
                      { label: "Paper BG", key: "paperBg" as const },
                      { label: "Paper Text", key: "paperText" as const },
                      { label: "Paper Border", key: "paperBorder" as const },
                      { label: "Accent Highlight", key: "accent" as const },
                      { label: "Primary Gold", key: "gold" as const },
                    ].map(colorMap => (
                      <div
                        key={colorMap.key}
                        className="flex items-center justify-between p-1 rounded bg-[var(--theme-editor-bg)]/40 text-[8.5px]"
                      >
                        <span className="truncate max-w-[60px] text-[var(--theme-sidebar-text)] font-mono">{colorMap.label}</span>
                        <input
                          type="color"
                          value={colors[colorMap.key]}
                          onChange={e => handleColorChange(colorMap.key, e.target.value)}
                          className="w-4 h-4 rounded border-none cursor-pointer p-0 bg-transparent shrink-0"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-1.5 pt-0.5">
                  <button
                    onClick={handleSave}
                    className="flex-1 py-1 bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-soft)] text-white rounded text-xs font-bold transition-colors cursor-pointer"
                  >
                    {editingThemeId ? "Update" : "Save & Apply"}
                  </button>
                  {editingThemeId && (
                    <button
                      onClick={() => {
                        setEditingThemeId(null);
                        setThemeName("My Custom Theme");
                        setColors(DEFAULT_DARK_COLORS);
                      }}
                      className="py-1 px-2 bg-[var(--theme-sidebar-active-bg)] text-[var(--theme-sidebar-text)] hover:bg-[var(--theme-sidebar-active-bg)]/80 rounded text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Custom Themes Catalog */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-0.5">
                  <span className="text-[9px] uppercase tracking-wider text-[var(--theme-sidebar-text)] font-mono font-bold">
                    Custom Catalog
                  </span>
                  <button
                    onClick={() => setShowImport(!showImport)}
                    className="text-[8px] font-mono text-[var(--theme-accent)] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Upload size={8} /> Import JSON
                  </button>
                </div>

                {/* Import section toggle */}
                {showImport && (
                  <div className="p-2 bg-[var(--theme-sidebar-bg)] rounded space-y-1">
                    <textarea
                      placeholder="Paste theme JSON here..."
                      value={importJson}
                      onChange={e => setImportJson(e.target.value)}
                      className="w-full h-12 bg-[var(--theme-editor-bg)] text-[var(--theme-editor-text)] p-1.5 rounded text-[8px] font-mono outline-none"
                    />
                    <div className="flex gap-1.5">
                      <button
                        onClick={handleImport}
                        className="py-0.5 px-1.5 bg-[var(--theme-accent)] text-white hover:bg-[var(--theme-accent-soft)] rounded text-[8px] font-bold transition-colors cursor-pointer"
                      >
                        Submit
                      </button>
                      <button
                        onClick={() => setShowImport(false)}
                        className="py-0.5 px-1.5 bg-[var(--theme-sidebar-active-bg)] text-[var(--theme-sidebar-text)] rounded text-[8px] transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Custom Themes List */}
                <div className="space-y-1 max-h-[110px] overflow-y-auto pr-0.5">
                  {customThemes.length > 0 ? (
                    customThemes.map(theme => (
                      <div
                        key={theme.id}
                        className={cn(
                          "p-2 rounded-xl flex items-center justify-between transition-all duration-200 text-xs",
                          activeTheme?.id === theme.id
                            ? "bg-[var(--theme-sidebar-active-bg)]/35 font-medium"
                            : "bg-[var(--theme-sidebar-bg)]/35"
                        )}
                      >
                        <div
                          onClick={() => {
                            setThemeMode("custom", theme.id);
                            applyTheme(theme);
                          }}
                          className="flex-1 cursor-pointer pr-1"
                        >
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--theme-sidebar-active-text)] leading-none">
                            {theme.name}
                            {activeTheme?.id === theme.id && (
                              <Check size={9} className="text-[var(--theme-accent)]" />
                            )}
                          </div>
                          <div className="text-[8px] text-[var(--theme-sidebar-text)]/60 font-mono mt-0.5 leading-none">
                            {theme.isDark ? "Dark theme style" : "Light theme style"}
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            onClick={() => handleEditSelect(theme)}
                            className="p-1 rounded hover:bg-[var(--theme-sidebar-active-bg)] text-[var(--theme-sidebar-text)] transition-colors cursor-pointer"
                            title="Edit theme"
                          >
                            <Palette size={10} />
                          </button>
                          <button
                            onClick={() => handleExport(theme.id)}
                            className="p-1 rounded hover:bg-[var(--theme-sidebar-active-bg)] text-[var(--theme-sidebar-text)] transition-colors cursor-pointer"
                            title="Export JSON"
                          >
                            <Download size={10} />
                          </button>
                          <button
                            onClick={() => deleteTheme(theme.id)}
                            className="p-1 rounded hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                            title="Delete Theme"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-[9px] text-[var(--theme-sidebar-text)]/40 italic font-mono">
                      No custom themes designed yet.
                    </div>
                  )}
                </div>
              </div>
            </Tabs.Content>
          </Tabs.Root>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
