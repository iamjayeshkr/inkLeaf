import { create } from "zustand";
import { FileNode, VersionSnapshot } from "../types";
import { db } from "../lib/db";

interface FileState {
  files: FileNode[];
  activeFileId: string | null;
  openTabs: string[];
  pinnedTabs: string[];
  recentFiles: string[];
  versionHistory: VersionSnapshot[];
  isLoading: boolean;

  // Lifecycle
  init: () => Promise<void>;

  // Operations
  createFile: (name: string, parentId: string | null, content?: string) => Promise<string>;
  createFolder: (name: string, parentId: string | null) => Promise<string>;
  deleteNode: (id: string) => Promise<void>;
  renameNode: (id: string, newName: string) => Promise<void>;
  updateFileContent: (id: string, content: string) => void;
  toggleFavorite: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  moveNode: (id: string, targetParentId: string | null) => Promise<void>;

  // Tabs & Navigation
  setActiveFileId: (id: string | null) => void;
  openTab: (id: string) => void;
  closeTab: (id: string) => void;
  togglePinTab: (id: string) => void;
  setOpenTabs: (ids: string[]) => void;

  // History & Snapshots
  createVersionSnapshot: (fileId: string, title?: string) => Promise<void>;
  loadVersionHistory: (fileId: string) => Promise<void>;
  restoreVersion: (fileId: string, snapshot: VersionSnapshot) => Promise<void>;
}

// In-memory debounce timers per file to batch writes to IndexedDB
const dbSaveTimeouts: Record<string, NodeJS.Timeout> = {};

const SAMPLE_WELCOME_MD = `# Advanced Markdown Studio (Inkleaf)

Welcome to your production-ready, browser-based Markdown Studio! This application combines the writing experience of Obsidian, the simplicity of Notion, and the live rendering quality of Typora.

## Core Features

- 📂 **Full File Explorer**: Create nested folders, rename, delete, duplicate, and drag-and-drop notes.
- ⚡ **Resizable Panels**: Smooth pointer-drag resizing with double-click auto-resets.
- ⚙️ **CodeMirror 6 Editor**: High-performance editor with word wrap, line folding, typewriter mode, and active line highlight.
- 🔮 **Premium Live Preview**: Real-time rendering with GitHub Flavored Markdown (GFM), footnotes, task lists, and tables.
- 🧪 **Interactive Mermaid & Math**: Render diagrams natively with zoom/pan and format formulas with KaTeX:
  $$ \\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi} $$
- 🎨 **Custom Theme Editor**: Build, import, and export themes adjusting CSS tokens directly.
- 📜 **Version History**: Real-time auto-saving and git-like side-by-side visual diff comparisons.
- 🎹 **Command Palette**: Press \`Cmd + K\` or \`Ctrl + K\` to fuzzy search files and execute editor shortcuts.
- 🔌 **AI Ready Plugin System**: Register model API keys (Gemini, Claude, OpenAI, Ollama) and load extensions on the fly!
- 💾 **100% Offline-First**: Built on IndexedDB. Your files, versions, and themes stay securely in your browser.

Happy writing!
`;

export const useFileStore = create<FileState>((set, get) => ({
  files: [],
  activeFileId: null,
  openTabs: [],
  pinnedTabs: [],
  recentFiles: [],
  versionHistory: [],
  isLoading: true,

  init: async () => {
    set({ isLoading: true });
    try {
      let storedFiles = await db.getAllFiles();

      // If database is empty, create initial sample workspace
      if (storedFiles.length === 0) {
        const welcomeFolderId = "folder-welcome";
        const welcomeFileId = "file-welcome";
        const sampleFileId = "file-sample";

        const welcomeFolder: FileNode = {
          id: welcomeFolderId,
          name: "Getting Started",
          type: "folder",
          parentId: null,
          isFavorite: false,
          isPinned: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        const welcomeFile: FileNode = {
          id: welcomeFileId,
          name: "Welcome to Markdown Studio",
          type: "file",
          content: SAMPLE_WELCOME_MD,
          parentId: welcomeFolderId,
          isFavorite: true,
          isPinned: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        const sampleMarkdownFile: FileNode = {
          id: sampleFileId,
          name: "Markdown Syntax Cheat Sheet",
          type: "file",
          content: `# Syntax Cheat Sheet

## Typography
You can use *italics*, **bold**, ~~strikethrough~~, or ==highlights==.

## Tasks
- [x] Create a great document
- [ ] Share Markdown Studio with others

## Callouts
> [!NOTE]
> This is a custom callout container.

> [!WARNING]
> Highlighting critical warnings.

## Code & Diagrams
\`\`\`javascript
const greet = () => "Hello, World!";
\`\`\`

\`\`\`mermaid
graph TD
    Start --> Edit[Write Markdown]
    Edit --> Preview[Instant Live Preview]
    Preview --> Export[Export PDF/DOCX]
\`\`\`
`,
          parentId: null,
          isFavorite: false,
          isPinned: false,
          createdAt: Date.now() - 3600000, // 1 hour ago
          updatedAt: Date.now() - 3600000,
        };

        storedFiles = [welcomeFolder, welcomeFile, sampleMarkdownFile];
        await db.saveFilesBulk(storedFiles);
      }

      // Load tabs and recents from settings
      const openTabs = (await db.getSetting<string[]>("openTabs")) || [];
      const pinnedTabs = (await db.getSetting<string[]>("pinnedTabs")) || [];
      const recentFiles = (await db.getSetting<string[]>("recentFiles")) || [];
      let activeFileId = await db.getSetting<string>("activeFileId");

      // Verify that active file and tabs actually exist
      const validTabs = openTabs.filter(id => storedFiles.some(f => f.id === id && f.type === "file"));
      const validPinned = pinnedTabs.filter(id => validTabs.includes(id));
      if (activeFileId && !storedFiles.some(f => f.id === activeFileId && f.type === "file")) {
        activeFileId = validTabs[0] || null;
      }

      set({
        files: storedFiles,
        activeFileId,
        openTabs: validTabs,
        pinnedTabs: validPinned,
        recentFiles: recentFiles.filter(id => storedFiles.some(f => f.id === id)),
        isLoading: false,
      });

      // Fetch version history if active file exists
      if (activeFileId) {
        await get().loadVersionHistory(activeFileId);
      }
    } catch (error) {
      console.error("Failed to initialize FileStore:", error);
      set({ isLoading: false });
    }
  },

  createFile: async (name, parentId, content = "") => {
    const id = `file-${Date.now()}`;
    const newFile: FileNode = {
      id,
      name,
      type: "file",
      content,
      parentId,
      isFavorite: false,
      isPinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Update in-memory state first (Optimistic UI)
    set(state => ({
      files: [...state.files, newFile],
    }));

    // Open the tab instantly without waiting for the DB write
    get().openTab(id);

    // Save to database asynchronously
    db.saveFile(newFile).catch(error => {
      console.error("Failed to write note to IndexedDB:", error);
    });

    return id;
  },

  createFolder: async (name, parentId) => {
    const id = `folder-${Date.now()}`;
    const newFolder: FileNode = {
      id,
      name,
      type: "folder",
      parentId,
      isFavorite: false,
      isPinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Update in-memory state first
    set(state => ({
      files: [...state.files, newFolder],
    }));

    // Save to database asynchronously
    db.saveFile(newFolder).catch(error => {
      console.error("Failed to write folder to IndexedDB:", error);
    });

    return id;
  },

  deleteNode: async id => {
    const { files, openTabs, activeFileId } = get();
    
    // Find all children recursively if deleting a folder
    const collectNodeIds = (nodeId: string): string[] => {
      const ids = [nodeId];
      const children = files.filter(f => f.parentId === nodeId);
      for (const child of children) {
        ids.push(...collectNodeIds(child.id));
      }
      return ids;
    };

    const targetIds = collectNodeIds(id);

    // Delete in IndexedDB
    for (const targetId of targetIds) {
      await db.deleteFile(targetId);
      await db.deleteVersionsForFile(targetId);
      if (dbSaveTimeouts[targetId]) {
        clearTimeout(dbSaveTimeouts[targetId]);
        delete dbSaveTimeouts[targetId];
      }
    }

    // Filter state lists
    const remainingFiles = files.filter(f => !targetIds.includes(f.id));
    const nextTabs = openTabs.filter(tabId => !targetIds.includes(tabId));
    let nextActive = activeFileId;
    if (activeFileId && targetIds.includes(activeFileId)) {
      nextActive = nextTabs[0] || null;
    }

    set(state => ({
      files: remainingFiles,
      openTabs: nextTabs,
      pinnedTabs: state.pinnedTabs.filter(tabId => !targetIds.includes(tabId)),
      recentFiles: state.recentFiles.filter(recentId => !targetIds.includes(recentId)),
      activeFileId: nextActive,
    }));

    // Update settings DB
    await db.saveSetting("openTabs", nextTabs);
    await db.saveSetting("activeFileId", nextActive);
    await db.saveSetting("pinnedTabs", get().pinnedTabs);
    await db.saveSetting("recentFiles", get().recentFiles);

    if (nextActive) {
      await get().loadVersionHistory(nextActive);
    } else {
      set({ versionHistory: [] });
    }
  },

  renameNode: async (id, newName) => {
    set(state => ({
      files: state.files.map(f =>
        f.id === id ? { ...f, name: newName, updatedAt: Date.now() } : f
      ),
    }));

    const updatedNode = get().files.find(f => f.id === id);
    if (updatedNode) {
      await db.saveFile(updatedNode);
    }
  },

  updateFileContent: (id, content) => {
    const { files } = get();
    const targetFile = files.find(f => f.id === id);
    if (!targetFile || targetFile.type !== "file") return;

    // Update state instantly in memory
    const updatedFile = { ...targetFile, content, updatedAt: Date.now() };
    set(state => ({
      files: state.files.map(f => (f.id === id ? updatedFile : f)),
    }));

    // Debounce write to IndexedDB
    if (dbSaveTimeouts[id]) {
      clearTimeout(dbSaveTimeouts[id]);
    }
    dbSaveTimeouts[id] = setTimeout(async () => {
      await db.saveFile(updatedFile);
      delete dbSaveTimeouts[id];
    }, 1000);
  },

  toggleFavorite: async id => {
    set(state => ({
      files: state.files.map(f =>
        f.id === id ? { ...f, isFavorite: !f.isFavorite, updatedAt: Date.now() } : f
      ),
    }));
    const updatedNode = get().files.find(f => f.id === id);
    if (updatedNode) {
      await db.saveFile(updatedNode);
    }
  },

  togglePin: async id => {
    set(state => ({
      files: state.files.map(f =>
        f.id === id ? { ...f, isPinned: !f.isPinned, updatedAt: Date.now() } : f
      ),
    }));
    const updatedNode = get().files.find(f => f.id === id);
    if (updatedNode) {
      await db.saveFile(updatedNode);
    }
  },

  moveNode: async (id, targetParentId) => {
    // Avoid cyclic folder nests
    if (id === targetParentId) return;
    
    set(state => ({
      files: state.files.map(f =>
        f.id === id ? { ...f, parentId: targetParentId, updatedAt: Date.now() } : f
      ),
    }));

    const updatedNode = get().files.find(f => f.id === id);
    if (updatedNode) {
      await db.saveFile(updatedNode);
    }
  },

  // --- Navigation & Tabs ---
  setActiveFileId: async id => {
    const currentActive = get().activeFileId;
    if (currentActive === id) return;

    set({ activeFileId: id });
    await db.saveSetting("activeFileId", id);

    if (id) {
      // Add to recent files (maintain uniqueness, cap at 10)
      set(state => {
        const filtered = state.recentFiles.filter(item => item !== id);
        const updatedRecents = [id, ...filtered].slice(0, 10);
        db.saveSetting("recentFiles", updatedRecents);
        return { recentFiles: updatedRecents };
      });
      // Load version snapshots
      await get().loadVersionHistory(id);
    } else {
      set({ versionHistory: [] });
    }
  },

  openTab: async id => {
    const { openTabs, files } = get();
    const node = files.find(f => f.id === id);
    if (!node || node.type !== "file") return;

    if (!openTabs.includes(id)) {
      const nextTabs = [...openTabs, id];
      set({ openTabs: nextTabs });
      await db.saveSetting("openTabs", nextTabs);
    }
    get().setActiveFileId(id);
  },

  closeTab: async id => {
    const { openTabs, activeFileId, pinnedTabs } = get();
    
    // Cannot close tab if pinned
    if (pinnedTabs.includes(id)) return;

    const nextTabs = openTabs.filter(t => t !== id);
    set({ openTabs: nextTabs });
    await db.saveSetting("openTabs", nextTabs);

    if (activeFileId === id) {
      const nextActive = nextTabs.length > 0 ? nextTabs[nextTabs.length - 1] : null;
      get().setActiveFileId(nextActive);
    }
  },

  togglePinTab: async id => {
    const { pinnedTabs, openTabs } = get();
    if (!openTabs.includes(id)) return;

    let nextPinned: string[];
    if (pinnedTabs.includes(id)) {
      nextPinned = pinnedTabs.filter(p => p !== id);
    } else {
      nextPinned = [...pinnedTabs, id];
    }

    set({ pinnedTabs: nextPinned });
    await db.saveSetting("pinnedTabs", nextPinned);
  },

  setOpenTabs: async ids => {
    set({ openTabs: ids });
    await db.saveSetting("openTabs", ids);
  },

  // --- Version Snapshots ---
  createVersionSnapshot: async (fileId, title) => {
    const file = get().files.find(f => f.id === fileId);
    if (!file || file.type !== "file") return;

    const snapshot: VersionSnapshot = {
      id: `ver-${Date.now()}`,
      fileId,
      timestamp: Date.now(),
      content: file.content || "",
      title: title || `Auto-save — ${new Date().toLocaleTimeString()}`,
    };

    await db.saveVersion(snapshot);
    await get().loadVersionHistory(fileId);
  },

  loadVersionHistory: async fileId => {
    try {
      const history = await db.getVersionsForFile(fileId);
      set({ versionHistory: history });
    } catch (error) {
      console.error("Failed to load versions:", error);
    }
  },

  restoreVersion: async (fileId, snapshot) => {
    const { files } = get();
    const file = files.find(f => f.id === fileId);
    if (!file || file.type !== "file") return;

    // Trigger an auto-save of current state before restoring
    await get().createVersionSnapshot(fileId, `Pre-restore Backup — ${new Date().toLocaleTimeString()}`);

    const restoredFile: FileNode = {
      ...file,
      content: snapshot.content,
      updatedAt: Date.now(),
    };

    set(state => ({
      files: state.files.map(f => (f.id === fileId ? restoredFile : f)),
    }));

    await db.saveFile(restoredFile);
    await get().loadVersionHistory(fileId);
  },
}));
