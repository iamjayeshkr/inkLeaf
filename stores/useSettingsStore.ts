import { create } from "zustand";
import { EditorConfig, PreviewConfig } from "../types";
import { db } from "../lib/db";

interface SettingsState {
  editorConfig: EditorConfig;
  previewConfig: PreviewConfig;
  sidebarCollapsed: boolean;
  previewCollapsed: boolean;
  themeMode: "light" | "dark" | "system" | "custom" | "sepia" | "nord" | "charcoal" | "rosepine" | "sakura" | "espresso" | "corporate" | "paper" | "apple" | "google" | "burger" | "creative";
  activeCustomThemeId: string | null;
  searchState: {
    isOpen: boolean;
    query: string;
    replaceQuery: string;
    isRegex: boolean;
    isCaseSensitive: boolean;
    isWholeWord: boolean;
    searchAll: boolean;
  };
  sidebarWidth: number;
  editorWidth: number; // For split panel sizing

  // Operations
  initSettings: () => Promise<void>;
  updateEditorConfig: (config: Partial<EditorConfig>) => Promise<void>;
  updatePreviewConfig: (config: Partial<PreviewConfig>) => Promise<void>;
  toggleSidebar: () => Promise<void>;
  togglePreview: () => Promise<void>;
  setThemeMode: (mode: "light" | "dark" | "system" | "custom" | "sepia" | "nord" | "charcoal" | "rosepine" | "sakura" | "espresso" | "corporate" | "paper" | "apple" | "google" | "burger" | "creative", customThemeId?: string | null) => Promise<void>;
  updateSearchState: (state: Partial<SettingsState["searchState"]>) => void;
  setPanelSizes: (sidebarWidth: number, editorWidth: number) => Promise<void>;
}

const DEFAULT_EDITOR_CONFIG: EditorConfig = {
  wordWrap: true,
  lineNumbers: true,
  codeFolding: true,
  typewriterMode: false,
  focusMode: false,
  distractionFree: false,
  fontSize: 14,
  tabSize: 2,
};

const DEFAULT_PREVIEW_CONFIG: PreviewConfig = {
  readingMode: false,
  presentationMode: false,
  previewFont: "sans",
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  editorConfig: DEFAULT_EDITOR_CONFIG,
  previewConfig: DEFAULT_PREVIEW_CONFIG,
  sidebarCollapsed: false,
  previewCollapsed: false,
  themeMode: "system",
  activeCustomThemeId: null,
  searchState: {
    isOpen: false,
    query: "",
    replaceQuery: "",
    isRegex: false,
    isCaseSensitive: false,
    isWholeWord: false,
    searchAll: false,
  },
  sidebarWidth: 260,
  editorWidth: 50, // 50% split width

  initSettings: async () => {
    const editorConfig = (await db.getSetting<EditorConfig>("editorConfig")) || DEFAULT_EDITOR_CONFIG;
    const previewConfig = (await db.getSetting<PreviewConfig>("previewConfig")) || DEFAULT_PREVIEW_CONFIG;
    const sidebarCollapsed = (await db.getSetting<boolean>("sidebarCollapsed")) || false;
    const previewCollapsed = (await db.getSetting<boolean>("previewCollapsed")) || false;
    const themeMode = (await db.getSetting<"light" | "dark" | "system" | "custom" | "sepia" | "nord" | "charcoal" | "rosepine" | "sakura" | "espresso" | "corporate" | "paper" | "apple" | "google" | "burger" | "creative">("themeMode")) || "system";
    const activeCustomThemeId = await db.getSetting<string>("activeCustomThemeId");
    const sidebarWidth = (await db.getSetting<number>("sidebarWidth")) || 260;
    const editorWidth = (await db.getSetting<number>("editorWidth")) || 50;

    set({
      editorConfig,
      previewConfig,
      sidebarCollapsed,
      previewCollapsed,
      themeMode,
      activeCustomThemeId,
      sidebarWidth,
      editorWidth,
    });
  },

  updateEditorConfig: async config => {
    const nextConfig = { ...get().editorConfig, ...config };
    set({ editorConfig: nextConfig });
    await db.saveSetting("editorConfig", nextConfig);
  },

  updatePreviewConfig: async config => {
    const nextConfig = { ...get().previewConfig, ...config };
    set({ previewConfig: nextConfig });
    await db.saveSetting("previewConfig", nextConfig);
  },

  toggleSidebar: async () => {
    const nextVal = !get().sidebarCollapsed;
    set({ sidebarCollapsed: nextVal });
    await db.saveSetting("sidebarCollapsed", nextVal);
  },

  togglePreview: async () => {
    const nextVal = !get().previewCollapsed;
    set({ previewCollapsed: nextVal });
    await db.saveSetting("previewCollapsed", nextVal);
  },

  setThemeMode: async (mode: "light" | "dark" | "system" | "custom" | "sepia" | "nord" | "charcoal" | "rosepine" | "sakura" | "espresso" | "corporate" | "paper" | "apple" | "google" | "burger" | "creative", customThemeId = null) => {
    set({ themeMode: mode, activeCustomThemeId: customThemeId });
    await db.saveSetting("themeMode", mode);
    await db.saveSetting("activeCustomThemeId", customThemeId);
  },

  updateSearchState: config => {
    set(state => ({
      searchState: { ...state.searchState, ...config },
    }));
  },

  setPanelSizes: async (sidebarWidth, editorWidth) => {
    set({ sidebarWidth, editorWidth });
    await db.saveSetting("sidebarWidth", sidebarWidth);
    await db.saveSetting("editorWidth", editorWidth);
  },
}));
