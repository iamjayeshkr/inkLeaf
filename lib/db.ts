import { FileNode, VersionSnapshot, CustomTheme, PluginExtension } from "../types";

const DB_NAME = "MarkdownStudioDB";
const DB_VERSION = 1;

export class MarkdownStudioDB {
  private db: IDBDatabase | null = null;

  private open(): Promise<IDBDatabase> {
    if (this.db) return Promise.resolve(this.db);

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = request.result;

        // Files store
        if (!db.objectStoreNames.contains("files")) {
          const fileStore = db.createObjectStore("files", { keyPath: "id" });
          fileStore.createIndex("parentId", "parentId", { unique: false });
          fileStore.createIndex("isFavorite", "isFavorite", { unique: false });
          fileStore.createIndex("isPinned", "isPinned", { unique: false });
        }

        // Versions store
        if (!db.objectStoreNames.contains("versions")) {
          const versionStore = db.createObjectStore("versions", { keyPath: "id" });
          versionStore.createIndex("fileId", "fileId", { unique: false });
          versionStore.createIndex("timestamp", "timestamp", { unique: false });
        }

        // Themes store
        if (!db.objectStoreNames.contains("themes")) {
          db.createObjectStore("themes", { keyPath: "id" });
        }

        // Plugins store
        if (!db.objectStoreNames.contains("plugins")) {
          db.createObjectStore("plugins", { keyPath: "id" });
        }

        // Settings store
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings");
        }
      };
    });
  }

  // --- Files ---
  public async getAllFiles(): Promise<FileNode[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("files", "readonly");
      const store = tx.objectStore("files");
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  public async saveFile(file: FileNode): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("files", "readwrite");
      const store = tx.objectStore("files");
      const request = store.put(file);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async saveFilesBulk(files: FileNode[]): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("files", "readwrite");
      const store = tx.objectStore("files");
      for (const file of files) {
        store.put(file);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async deleteFile(id: string): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("files", "readwrite");
      const store = tx.objectStore("files");
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- Versions ---
  public async getVersionsForFile(fileId: string): Promise<VersionSnapshot[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("versions", "readonly");
      const store = tx.objectStore("versions");
      const index = store.index("fileId");
      const request = index.getAll(IDBKeyRange.only(fileId));
      request.onsuccess = () => {
        const sorted = (request.result || []).sort(
          (a, b) => b.timestamp - a.timestamp
        );
        resolve(sorted);
      };
      request.onerror = () => reject(request.error);
    });
  }

  public async saveVersion(version: VersionSnapshot): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("versions", "readwrite");
      const store = tx.objectStore("versions");
      const request = store.put(version);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async deleteVersionsForFile(fileId: string): Promise<void> {
    const db = await this.open();
    const versions = await this.getVersionsForFile(fileId);
    return new Promise((resolve, reject) => {
      const tx = db.transaction("versions", "readwrite");
      const store = tx.objectStore("versions");
      for (const v of versions) {
        store.delete(v.id);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- Themes ---
  public async getAllThemes(): Promise<CustomTheme[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("themes", "readonly");
      const store = tx.objectStore("themes");
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  public async saveTheme(theme: CustomTheme): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("themes", "readwrite");
      const store = tx.objectStore("themes");
      const request = store.put(theme);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async deleteTheme(id: string): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("themes", "readwrite");
      const store = tx.objectStore("themes");
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- Plugins ---
  public async getAllPlugins(): Promise<PluginExtension[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("plugins", "readonly");
      const store = tx.objectStore("plugins");
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  public async savePlugin(plugin: PluginExtension): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("plugins", "readwrite");
      const store = tx.objectStore("plugins");
      const request = store.put(plugin);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async deletePlugin(id: string): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("plugins", "readwrite");
      const store = tx.objectStore("plugins");
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- Settings ---
  public async getSetting<T>(key: string): Promise<T | null> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("settings", "readonly");
      const store = tx.objectStore("settings");
      const request = store.get(key);
      request.onsuccess = () => resolve((request.result as T) || null);
      request.onerror = () => reject(request.error);
    });
  }

  public async saveSetting<T>(key: string, value: T): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("settings", "readwrite");
      const store = tx.objectStore("settings");
      const request = store.put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton database instance
export const db = new MarkdownStudioDB();
