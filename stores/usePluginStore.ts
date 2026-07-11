import { create } from "zustand";
import { PluginExtension, AIProviderConfig } from "../types";
import { db } from "../lib/db";

interface PluginState {
  plugins: PluginExtension[];
  aiConfigs: Record<string, AIProviderConfig>;
  isLoading: boolean;

  // Actions
  initPlugins: () => Promise<void>;
  addPlugin: (name: string, description: string, author: string, code: string) => Promise<string>;
  updatePlugin: (id: string, fields: Partial<PluginExtension>) => Promise<void>;
  deletePlugin: (id: string) => Promise<void>;
  updateAIConfig: (id: string, fields: Partial<AIProviderConfig>) => Promise<void>;

  // Runtime Hooks
  runOnRender: (text: string) => string;
  runOnBeforeSave: (text: string) => string;
}

const DEFAULT_AI_CONFIGS: Record<string, AIProviderConfig> = {
  openai: {
    id: "openai",
    name: "OpenAI",
    apiKey: "",
    endpoint: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o",
  },
  claude: {
    id: "claude",
    name: "Anthropic Claude",
    apiKey: "",
    endpoint: "https://api.anthropic.com/v1/messages",
    model: "claude-3-5-sonnet-20241022",
  },
  gemini: {
    id: "gemini",
    name: "Google Gemini",
    apiKey: "",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent",
    model: "gemini-1.5-pro",
  },
  ollama: {
    id: "ollama",
    name: "Ollama (Local)",
    apiKey: "",
    endpoint: "http://localhost:11434/api/chat",
    model: "qwen2.5:3b",
  },
};

// Evaluates a plugin's code safely, returning its hook exports.
const compilePlugin = (code: string) => {
  try {
    const fn = new Function(`
      const module = { exports: {} };
      const exports = module.exports;
      ${code}
      return module.exports;
    `);
    return fn();
  } catch (error) {
    console.error("Plugin compilation error:", error);
    return null;
  }
};

export const usePluginStore = create<PluginState>((set, get) => ({
  plugins: [],
  aiConfigs: DEFAULT_AI_CONFIGS,
  isLoading: true,

  initPlugins: async () => {
    set({ isLoading: true });
    try {
      const plugins = await db.getAllPlugins();

      // Load AI configs from settings
      const loadedAIConfigs: Record<string, AIProviderConfig> = { ...DEFAULT_AI_CONFIGS };
      for (const key of Object.keys(DEFAULT_AI_CONFIGS)) {
        const saved = await db.getSetting<AIProviderConfig>(`ai_${key}`);
        if (saved) {
          loadedAIConfigs[key] = saved;
        }
      }

      // If no plugins exist, add a sample text formatter plugin
      if (plugins.length === 0) {
        const samplePlugin: PluginExtension = {
          id: "plugin-emoji-replacer",
          name: "Smart Emoji Replacer",
          version: "1.0.0",
          description: "Replaces text shortcuts like :smile: or :heart: with native emojis.",
          author: "Markdown Studio",
          enabled: true,
          code: `
module.exports = {
  onRender: function(text) {
    const replacements = {
      ":smile:": "😊",
      ":heart:": "❤️",
      ":check:": "✅",
      ":warn:": "⚠️",
      ":rocket:": "🚀"
    };
    let updated = text;
    for (const key in replacements) {
      updated = updated.split(key).join(replacements[key]);
    }
    return updated;
  },
  onBeforeSave: function(text) {
    return text;
  }
};
          `,
        };
        await db.savePlugin(samplePlugin);
        plugins.push(samplePlugin);
      }

      set({ plugins, aiConfigs: loadedAIConfigs, isLoading: false });
    } catch (e) {
      console.error("Failed to load plugins:", e);
      set({ isLoading: false });
    }
  },

  addPlugin: async (name, description, author, code) => {
    const id = `plugin-${Date.now()}`;
    const newPlugin: PluginExtension = {
      id,
      name,
      version: "1.0.0",
      description,
      author,
      enabled: true,
      code,
    };

    set(state => ({
      plugins: [...state.plugins, newPlugin],
    }));

    await db.savePlugin(newPlugin);
    return id;
  },

  updatePlugin: async (id, fields) => {
    set(state => ({
      plugins: state.plugins.map(p => (p.id === id ? { ...p, ...fields } : p)),
    }));
    const updated = get().plugins.find(p => p.id === id);
    if (updated) {
      await db.savePlugin(updated);
    }
  },

  deletePlugin: async id => {
    set(state => ({
      plugins: state.plugins.filter(p => p.id !== id),
    }));
    await db.deletePlugin(id);
  },

  updateAIConfig: async (id, fields) => {
    const current = get().aiConfigs[id];
    if (!current) return;

    const updated = { ...current, ...fields };
    set(state => ({
      aiConfigs: {
        ...state.aiConfigs,
        [id]: updated,
      },
    }));

    await db.saveSetting(`ai_${id}`, updated);
  },

  runOnRender: text => {
    let result = text;
    const activePlugins = get().plugins.filter(p => p.enabled);

    for (const plugin of activePlugins) {
      const compiled = compilePlugin(plugin.code);
      if (compiled && typeof compiled.onRender === "function") {
        try {
          result = compiled.onRender(result) || result;
        } catch (err) {
          console.error(`Error running plugin ${plugin.name} onRender:`, err);
        }
      }
    }
    return result;
  },

  runOnBeforeSave: text => {
    let result = text;
    const activePlugins = get().plugins.filter(p => p.enabled);

    for (const plugin of activePlugins) {
      const compiled = compilePlugin(plugin.code);
      if (compiled && typeof compiled.onBeforeSave === "function") {
        try {
          result = compiled.onBeforeSave(result) || result;
        } catch (err) {
          console.error(`Error running plugin ${plugin.name} onBeforeSave:`, err);
        }
      }
    }
    return result;
  },
}));
