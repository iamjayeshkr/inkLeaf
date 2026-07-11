import { create } from "zustand";
import { CustomTheme } from "../types";
import { db } from "../lib/db";

interface ThemeState {
  customThemes: CustomTheme[];
  activeTheme: CustomTheme | null;
  isLoading: boolean;

  // Actions
  initThemes: (currentMode: string, customThemeId: string | null) => Promise<void>;
  createTheme: (theme: Omit<CustomTheme, "id">) => Promise<string>;
  updateTheme: (id: string, theme: Partial<CustomTheme>) => Promise<void>;
  deleteTheme: (id: string) => Promise<void>;
  applyTheme: (theme: CustomTheme | null) => void;
  importTheme: (themeJson: string) => Promise<string>;
  exportTheme: (id: string) => string;
}

// Built-in presets for user choices
export const THEME_PRESETS: Record<string, CustomTheme> = {
  sepia: {
    id: "sepia",
    name: "Classic Sepia",
    isDark: false,
    colors: {
      bg: "#F4EFEB",
      text: "#433422",
      sidebarBg: "#EADFD6",
      sidebarText: "#5C4A37",
      sidebarActiveBg: "#DFD0C4",
      sidebarActiveText: "#2C1E10",
      editorBg: "#FAF6F0",
      editorText: "#4A3B2C",
      editorCursor: "#C5963E",
      editorLineNumbers: "#9E8B79",
      paperBg: "#FAF6F0",
      paperText: "#3C2F1E",
      paperBorder: "#E6DEC9",
      accent: "#C5963E",
      accentSoft: "#EAD2A8",
      gold: "#C5963E",
    },
  },
  nord: {
    id: "nord",
    name: "Nord Frost",
    isDark: true,
    colors: {
      bg: "#2E3440",
      text: "#D8DEE9",
      sidebarBg: "#242933",
      sidebarText: "#939CAE",
      sidebarActiveBg: "#3B4252",
      sidebarActiveText: "#ECEFF4",
      editorBg: "#2E3440",
      editorText: "#D8DEE9",
      editorCursor: "#88C0D0",
      editorLineNumbers: "#4C566A",
      paperBg: "#2E3440",
      paperText: "#D8DEE9",
      paperBorder: "#3B4252",
      accent: "#88C0D0",
      accentSoft: "#81A1C1",
      gold: "#BF616A",
    },
  },
  charcoal: {
    id: "charcoal",
    name: "Charcoal Dark",
    isDark: true,
    colors: {
      bg: "#121212",
      text: "#E0E0E0",
      sidebarBg: "#1C1C1C",
      sidebarText: "#888888",
      sidebarActiveBg: "#2D2D2D",
      sidebarActiveText: "#FFFFFF",
      editorBg: "#181818",
      editorText: "#E0E0E0",
      editorCursor: "#E5C07B",
      editorLineNumbers: "#4B5263",
      paperBg: "#181818",
      paperText: "#E0E0E0",
      paperBorder: "#242424",
      accent: "#E5C07B",
      accentSoft: "#3E4451",
      gold: "#E5C07B",
    },
  },
  rosepine: {
    id: "rosepine",
    name: "Rosé Pine",
    isDark: true,
    colors: {
      bg: "#191724",
      text: "#e0def4",
      sidebarBg: "#1f1d2e",
      sidebarText: "#908caa",
      sidebarActiveBg: "#2a2837",
      sidebarActiveText: "#e0def4",
      editorBg: "#191724",
      editorText: "#e0def4",
      editorCursor: "#ebbc50",
      editorLineNumbers: "#6e6a86",
      paperBg: "#191724",
      paperText: "#e0def4",
      paperBorder: "#2a2837",
      accent: "#ebbc50",
      accentSoft: "#31748f",
      gold: "#ebbc50",
    },
  },
  sakura: {
    id: "sakura",
    name: "Sakura Bloom",
    isDark: false,
    colors: {
      bg: "#FFF0F5",
      text: "#4A353B",
      sidebarBg: "#FADADD",
      sidebarText: "#8B5A65",
      sidebarActiveBg: "#F4C2C2",
      sidebarActiveText: "#4A202C",
      editorBg: "#FFF8FA",
      editorText: "#4C2D35",
      editorCursor: "#D87093",
      editorLineNumbers: "#C08A95",
      paperBg: "#FFFDFE",
      paperText: "#3A1E24",
      paperBorder: "#F3D0D7",
      accent: "#D87093",
      accentSoft: "#FFD1DC",
      gold: "#FFB7C5",
    },
  },
  espresso: {
    id: "espresso",
    name: "Espresso Warm",
    isDark: true,
    colors: {
      bg: "#221C1A",
      text: "#E5D3B3",
      sidebarBg: "#1C1615",
      sidebarText: "#9E8A83",
      sidebarActiveBg: "#382C29",
      sidebarActiveText: "#F2E6D8",
      editorBg: "#221C1A",
      editorText: "#ECE0D1",
      editorCursor: "#D0A379",
      editorLineNumbers: "#6E5A54",
      paperBg: "#221C1A",
      paperText: "#E5D3B3",
      paperBorder: "#382C29",
      accent: "#D0A379",
      accentSoft: "#4E3629",
      gold: "#D0A379",
    },
  },
  corporate: {
    id: "corporate",
    name: "Obsidian Steel",
    isDark: true,
    colors: {
      bg: "#1A202C",
      text: "#E2E8F0",
      sidebarBg: "#111625",
      sidebarText: "#718096",
      sidebarActiveBg: "#2D3748",
      sidebarActiveText: "#EDF2F7",
      editorBg: "#1A202C",
      editorText: "#F7FAFC",
      editorCursor: "#3182CE",
      editorLineNumbers: "#4A5568",
      paperBg: "#1A202C",
      paperText: "#E2E8F0",
      paperBorder: "#2D3748",
      accent: "#3182CE",
      accentSoft: "#2B6CB0",
      gold: "#DD6B20",
    },
  },
  paper: {
    id: "paper",
    name: "Analog Paper",
    isDark: false,
    colors: {
      bg: "#F6F3EB",
      text: "#3C3225",
      sidebarBg: "#EFECE4",
      sidebarText: "#6C5F4D",
      sidebarActiveBg: "#E5DFD4",
      sidebarActiveText: "#3C3225",
      editorBg: "#FBF9F6",
      editorText: "#3C3225",
      editorCursor: "#8D7B68",
      editorLineNumbers: "#C4BAAC",
      paperBg: "#FDFBF7",
      paperText: "#2D2215",
      paperBorder: "transparent",
      accent: "#8D7B68",
      accentSoft: "#E5DFD4",
      gold: "#C8B6A4",
    },
  },
  apple: {
    id: "apple",
    name: "Apple Modern",
    isDark: false,
    colors: {
      bg: "#F5F5F7",
      text: "#1D1D1F",
      sidebarBg: "#E8E8ED",
      sidebarText: "#515154",
      sidebarActiveBg: "#FFFFFF",
      sidebarActiveText: "#000000",
      editorBg: "#FFFFFF",
      editorText: "#1D1D1F",
      editorCursor: "#0066CC",
      editorLineNumbers: "#A1A1A6",
      paperBg: "#FFFFFF",
      paperText: "#1D1D1F",
      paperBorder: "transparent",
      accent: "#0066CC",
      accentSoft: "#E5F1FA",
      gold: "#BF8F00",
    },
  },
  google: {
    id: "google",
    name: "Google Material",
    isDark: false,
    colors: {
      bg: "#F0F4F9",
      text: "#1F1F1F",
      sidebarBg: "#E9EEF6",
      sidebarText: "#444746",
      sidebarActiveBg: "#D3E3FD",
      sidebarActiveText: "#041E49",
      editorBg: "#FFFFFF",
      editorText: "#1F1F1F",
      editorCursor: "#0B57D0",
      editorLineNumbers: "#C4C7C5",
      paperBg: "#FFFFFF",
      paperText: "#1F1F1F",
      paperBorder: "transparent",
      accent: "#0B57D0",
      accentSoft: "#E8F0FE",
      gold: "#B06000",
    },
  },
  burger: {
    id: "burger",
    name: "Burger Feast",
    isDark: false,
    colors: {
      bg: "#F5EBE0",
      text: "#4E3629",
      sidebarBg: "#E3D5CA",
      sidebarText: "#7F5539",
      sidebarActiveBg: "#DDB892",
      sidebarActiveText: "#4E3629",
      editorBg: "#FDF8F5",
      editorText: "#4E3629",
      editorCursor: "#BC4749",
      editorLineNumbers: "#B7B7A4",
      paperBg: "#FFFFFF",
      paperText: "#3E2723",
      paperBorder: "transparent",
      accent: "#BC4749",
      accentSoft: "#F2E8CF",
      gold: "#F4A261",
    },
  },
  creative: {
    id: "creative",
    name: "Creative Neon",
    isDark: true,
    colors: {
      bg: "#0F0C1B",
      text: "#F1EBF9",
      sidebarBg: "#16122C",
      sidebarText: "#9E95C7",
      sidebarActiveBg: "#2D2054",
      sidebarActiveText: "#FF79C6",
      editorBg: "#0F0C1B",
      editorText: "#F1EBF9",
      editorCursor: "#FF79C6",
      editorLineNumbers: "#6272A4",
      paperBg: "#16122C",
      paperText: "#F1EBF9",
      paperBorder: "transparent",
      accent: "#8BE9FD",
      accentSoft: "rgba(139, 233, 253, 0.15)",
      gold: "#FFB86C",
    },
  },
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  customThemes: [],
  activeTheme: null,
  isLoading: true,

  initThemes: async (currentMode, customThemeId) => {
    set({ isLoading: true });
    try {
      const themes = await db.getAllThemes();
      set({ customThemes: themes, isLoading: false });

      // Apply initial theme
      if (currentMode === "custom" && customThemeId) {
        const customTheme = themes.find(t => t.id === customThemeId) || THEME_PRESETS.sepia;
        get().applyTheme(customTheme);
      } else if (currentMode !== "custom" && THEME_PRESETS[currentMode]) {
        get().applyTheme(THEME_PRESETS[currentMode]);
      } else {
        get().applyTheme(null); // Clear custom styles (use base tailwind)
      }
    } catch (e) {
      console.error("Failed to load custom themes:", e);
      set({ isLoading: false });
    }
  },

  createTheme: async themeData => {
    const id = `theme-${Date.now()}`;
    const newTheme: CustomTheme = {
      ...themeData,
      id,
    };

    set(state => ({
      customThemes: [...state.customThemes, newTheme],
    }));

    await db.saveTheme(newTheme);
    return id;
  },

  updateTheme: async (id, updatedFields) => {
    set(state => ({
      customThemes: state.customThemes.map(t =>
        t.id === id ? { ...t, ...updatedFields, colors: { ...t.colors, ...updatedFields.colors } } : t
      ),
    }));

    const updated = get().customThemes.find(t => t.id === id);
    if (updated) {
      await db.saveTheme(updated);
      if (get().activeTheme?.id === id) {
        get().applyTheme(updated);
      }
    }
  },

  deleteTheme: async id => {
    set(state => ({
      customThemes: state.customThemes.filter(t => t.id !== id),
    }));
    await db.deleteTheme(id);

    // If active theme was deleted, fall back to default
    if (get().activeTheme?.id === id) {
      set({ activeTheme: null });
      get().applyTheme(null);
    }
  },

  applyTheme: theme => {
    set({ activeTheme: theme });
    const root = document.documentElement;

    if (!theme) {
      // Reset variables to let tailwind base colors take over
      root.style.removeProperty("--theme-bg");
      root.style.removeProperty("--theme-text");
      root.style.removeProperty("--theme-sidebar-bg");
      root.style.removeProperty("--theme-sidebar-text");
      root.style.removeProperty("--theme-sidebar-active-bg");
      root.style.removeProperty("--theme-sidebar-active-text");
      root.style.removeProperty("--theme-editor-bg");
      root.style.removeProperty("--theme-editor-text");
      root.style.removeProperty("--theme-editor-cursor");
      root.style.removeProperty("--theme-editor-line-numbers");
      root.style.removeProperty("--theme-paper-bg");
      root.style.removeProperty("--theme-paper-text");
      root.style.removeProperty("--theme-paper-border");
      root.style.removeProperty("--theme-accent");
      root.style.removeProperty("--theme-accent-soft");
      root.style.removeProperty("--theme-gold");
      return;
    }

    // Set variable overrides
    const { colors } = theme;
    root.style.setProperty("--theme-bg", colors.bg);
    root.style.setProperty("--theme-text", colors.text);
    root.style.setProperty("--theme-sidebar-bg", colors.sidebarBg);
    root.style.setProperty("--theme-sidebar-text", colors.sidebarText);
    root.style.setProperty("--theme-sidebar-active-bg", colors.sidebarActiveBg);
    root.style.setProperty("--theme-sidebar-active-text", colors.sidebarActiveText);
    root.style.setProperty("--theme-editor-bg", colors.editorBg);
    root.style.setProperty("--theme-editor-text", colors.editorText);
    root.style.setProperty("--theme-editor-cursor", colors.editorCursor);
    root.style.setProperty("--theme-editor-line-numbers", colors.editorLineNumbers);
    root.style.setProperty("--theme-paper-bg", colors.paperBg);
    root.style.setProperty("--theme-paper-text", colors.paperText);
    root.style.setProperty("--theme-paper-border", colors.paperBorder);
    root.style.setProperty("--theme-accent", colors.accent);
    root.style.setProperty("--theme-accent-soft", colors.accentSoft);
    root.style.setProperty("--theme-gold", colors.gold);
  },

  importTheme: async jsonString => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.name || !parsed.colors) {
        throw new Error("Invalid theme structure");
      }
      const id = await get().createTheme({
        name: parsed.name,
        isDark: parsed.isDark ?? true,
        colors: parsed.colors,
      });
      return id;
    } catch (e) {
      console.error(e);
      throw new Error("Failed to import theme: Invalid JSON");
    }
  },

  exportTheme: id => {
    const theme = get().customThemes.find(t => t.id === id) || THEME_PRESETS[id];
    if (!theme) throw new Error("Theme not found");
    return JSON.stringify({
      name: theme.name,
      isDark: theme.isDark,
      colors: theme.colors,
    }, null, 2);
  },
}));
