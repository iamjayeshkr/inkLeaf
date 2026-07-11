export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  parentId: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface VersionSnapshot {
  id: string;
  fileId: string;
  timestamp: number;
  content: string;
  title: string;
}

export interface CustomTheme {
  id: string;
  name: string;
  isDark: boolean;
  colors: {
    bg: string;             // Main workspace background
    text: string;           // Main text color
    sidebarBg: string;      // Sidebar background
    sidebarText: string;    // Sidebar text
    sidebarActiveBg: string;// Sidebar active file background
    sidebarActiveText: string;// Sidebar active file text
    editorBg: string;       // Editor background
    editorText: string;     // Editor text
    editorCursor: string;   // Editor cursor/caret
    editorLineNumbers: string; // Line numbers color
    paperBg: string;        // Preview paper background
    paperText: string;      // Preview paper text
    paperBorder: string;    // Preview paper borders/lines
    accent: string;         // Primary action/button color
    accentSoft: string;     // Secondary highlight color
    gold: string;           // Headers/blockquote/list accent color
  };
}

export interface PluginExtension {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  enabled: boolean;
  code: string; // Compiled JS bundle containing lifecycle hooks
}

export interface AIProviderConfig {
  id: "openai" | "claude" | "gemini" | "ollama";
  name: string;
  apiKey: string;
  endpoint: string;
  model: string;
}

export interface EditorConfig {
  wordWrap: boolean;
  lineNumbers: boolean;
  codeFolding: boolean;
  typewriterMode: boolean;
  focusMode: boolean;
  distractionFree: boolean;
  fontSize: number;
  tabSize: number;
}

export interface PreviewConfig {
  readingMode: boolean;
  presentationMode: boolean;
  previewFont?: "sans" | "serif" | "handwriting" | "mono";
}
