"use client";

import React, { useState, useEffect } from "react";
import { usePluginStore } from "../../../stores/usePluginStore";
import { cn } from "../../../lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { X, Sparkles, Plus, Trash2, Cpu, Check, AlertCircle, FileCode } from "lucide-react";
import { AIProviderConfig } from "../../../types";

interface PluginManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PluginManager({ isOpen, onClose }: PluginManagerProps) {
  const {
    plugins,
    aiConfigs,
    addPlugin,
    updatePlugin,
    deletePlugin,
    updateAIConfig,
  } = usePluginStore();

  const [pluginName, setPluginName] = useState("");
  const [pluginDesc, setPluginDesc] = useState("");
  const [pluginCode, setPluginCode] = useState("");
  const [showAddPlugin, setShowAddPlugin] = useState(false);

  // Active AI Provider editing state
  const [editingAI, setEditingAI] = useState<string>("gemini");

  // Local drafts state to allow explicit saving/submitting
  const [draftConfigs, setDraftConfigs] = useState<Record<string, AIProviderConfig>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync draft configurations with store values on open
  useEffect(() => {
    if (aiConfigs) {
      setDraftConfigs(JSON.parse(JSON.stringify(aiConfigs)));
    }
  }, [aiConfigs, isOpen]);

  const handleSavePlugin = async () => {
    if (!pluginName.trim() || !pluginCode.trim()) return;
    try {
      await addPlugin(
        pluginName.trim(),
        pluginDesc.trim() || "Custom user plugin",
        "Developer",
        pluginCode
      );
      setPluginName("");
      setPluginDesc("");
      setPluginCode("");
      setShowAddPlugin(false);
      alert("Plugin registered successfully!");
    } catch (e) {
      alert("Failed to compile and save plugin.");
    }
  };

  const handleAIFieldChange = (providerId: string, field: string, value: string) => {
    setDraftConfigs(prev => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        [field]: value
      }
    }));
  };

  const handleSaveAIConfig = async () => {
    if (!editingAI || !draftConfigs[editingAI]) return;
    await updateAIConfig(editingAI, draftConfigs[editingAI]);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay className="fixed inset-0 z-45 bg-black/60 backdrop-blur-sm" />

        {/* Dialog Content */}
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[90vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 transform rounded-2xl border border-[var(--theme-paper-border)]/20 bg-[var(--theme-editor-bg)] text-[var(--theme-editor-text)] p-6 shadow-2xl overflow-y-auto select-none flex flex-col gap-5 focus:outline-none">
          
          {/* Header */}
          <div className="flex justify-between items-center border-b border-[var(--theme-paper-border)]/15 pb-3">
            <Dialog.Title className="flex items-center gap-2 font-serif text-[16px] font-bold text-[var(--theme-sidebar-active-text)]">
              <Sparkles size={16} className="text-purple-400" />
              Extensions & AI Orchestration
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1.5 rounded-lg hover:bg-[var(--theme-sidebar-active-bg)] text-[var(--theme-sidebar-text)]/60 hover:text-[var(--theme-sidebar-active-text)] transition-colors cursor-pointer">
                <X size={15} />
              </button>
            </Dialog.Close>
          </div>

          {/* Radix tabs for AI configs vs Plugins */}
          <Tabs.Root defaultValue="ai" className="flex flex-col flex-1 min-h-0">
            <Tabs.List className="flex gap-1 bg-[var(--theme-sidebar-bg)] p-1 rounded-xl border border-[var(--theme-paper-border)]/10 text-xs font-mono font-semibold text-[var(--theme-sidebar-text)] mb-5 shrink-0">
              <Tabs.Trigger
                value="ai"
                className="flex-1 px-4 py-2 rounded-lg data-[state=active]:bg-[var(--theme-editor-bg)] data-[state=active]:text-[var(--theme-sidebar-active-text)] data-[state=active]:shadow-sm outline-none cursor-pointer transition-all text-center"
              >
                AI Copilot Integration
              </Tabs.Trigger>
              <Tabs.Trigger
                value="plugins"
                className="flex-1 px-4 py-2 rounded-lg data-[state=active]:bg-[var(--theme-editor-bg)] data-[state=active]:text-[var(--theme-sidebar-active-text)] data-[state=active]:shadow-sm outline-none cursor-pointer transition-all text-center"
              >
                Custom Script Plugins
              </Tabs.Trigger>
            </Tabs.List>

            {/* TAB 1: AI Settings */}
            <Tabs.Content value="ai" className="space-y-4 outline-none flex-1 overflow-y-auto pr-1">
              <div className="p-3.5 bg-purple-500/5 border border-purple-500/15 rounded-xl text-xs leading-relaxed text-[var(--theme-sidebar-text)] font-sans">
                💡 **AI Ready Architecture**: Configure your local keys and endpoints. These settings are stored entirely in your local sandbox browser memory, ensuring 100% privacy and zero middleman servers.
              </div>

              {/* Grid: Selector vs Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left Provider List */}
                <div className="space-y-2 md:border-r border-[var(--theme-paper-border)]/10 md:pr-4">
                  {[
                    { id: "ollama", name: "Ollama (Local)", desc: "Local Offline LLM" },
                    { id: "gemini", name: "Google Gemini", desc: "Cloud API Key" },
                    { id: "openai", name: "OpenAI GPT", desc: "Cloud API Key" },
                    { id: "claude", name: "Anthropic Claude", desc: "Cloud API Key" },
                  ].map(provider => (
                    <div
                      key={provider.id}
                      onClick={() => setEditingAI(provider.id)}
                      className={cn(
                        "p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col gap-1 text-left relative",
                        editingAI === provider.id
                          ? "border-[var(--theme-accent)] bg-[var(--theme-sidebar-active-bg)]/30 text-[var(--theme-sidebar-active-text)] shadow-sm"
                          : "border-[var(--theme-paper-border)]/10 bg-[var(--theme-sidebar-bg)]/30 text-[var(--theme-sidebar-text)] hover:bg-[var(--theme-sidebar-active-bg)]/40"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-mono text-xs font-bold">{provider.name}</span>
                        {aiConfigs[provider.id]?.apiKey && (
                          <Check size={12} className="text-emerald-500 shrink-0" />
                        )}
                      </div>
                      <span className="text-[9px] opacity-60">
                        {provider.desc}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Right Input Fields */}
                <div className="md:col-span-2 space-y-4 p-4 rounded-xl border border-[var(--theme-paper-border)]/10 bg-[var(--theme-sidebar-bg)]/20">
                  {editingAI && draftConfigs[editingAI] && (
                    <>
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--theme-sidebar-active-text)] border-b border-[var(--theme-paper-border)]/10 pb-2">
                        <Cpu size={14} className="text-[var(--theme-accent)]" />
                        <span>Configuring {draftConfigs[editingAI].name}</span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[9px] uppercase tracking-wider text-[var(--theme-sidebar-text)] font-mono font-bold">API Endpoint</label>
                        <input
                          type="text"
                          value={draftConfigs[editingAI].endpoint || ""}
                          onChange={e => handleAIFieldChange(editingAI, "endpoint", e.target.value)}
                          className="w-full bg-[var(--theme-sidebar-bg)]/50 border border-[var(--theme-paper-border)]/15 px-3 py-2 rounded-lg text-xs font-mono outline-none focus:ring-1 focus:ring-[var(--theme-accent)] focus:border-[var(--theme-accent)] text-[var(--theme-editor-text)] transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[9px] uppercase tracking-wider text-[var(--theme-sidebar-text)] font-mono font-bold">Local API Key</label>
                        <input
                          type="password"
                          value={draftConfigs[editingAI].apiKey || ""}
                          onChange={e => handleAIFieldChange(editingAI, "apiKey", e.target.value)}
                          className="w-full bg-[var(--theme-sidebar-bg)]/50 border border-[var(--theme-paper-border)]/15 px-3 py-2 rounded-lg text-xs font-mono outline-none focus:ring-1 focus:ring-[var(--theme-accent)] focus:border-[var(--theme-accent)] text-[var(--theme-editor-text)] transition-all"
                          placeholder={draftConfigs[editingAI].apiKey ? "••••••••••••••••" : "Paste key..."}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[9px] uppercase tracking-wider text-[var(--theme-sidebar-text)] font-mono font-bold">Default Model ID</label>
                        <input
                          type="text"
                          value={draftConfigs[editingAI].model || ""}
                          onChange={e => handleAIFieldChange(editingAI, "model", e.target.value)}
                          className="w-full bg-[var(--theme-sidebar-bg)]/50 border border-[var(--theme-paper-border)]/15 px-3 py-2 rounded-lg text-xs font-mono outline-none focus:ring-1 focus:ring-[var(--theme-accent)] focus:border-[var(--theme-accent)] text-[var(--theme-editor-text)] transition-all"
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-between gap-4 border-t border-[var(--theme-paper-border)]/10 mt-2">
                        <button
                          onClick={handleSaveAIConfig}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-soft)] text-white text-xs font-serif font-bold shadow-md transition-colors cursor-pointer"
                        >
                          {saveSuccess ? (
                            <>
                              <Check size={13} className="text-white animate-bounce" />
                              <span>Settings Saved!</span>
                            </>
                          ) : (
                            <span>Save Configuration</span>
                          )}
                        </button>
                        {saveSuccess && (
                          <span className="text-[10px] text-emerald-500 font-mono font-bold animate-pulse">
                            Successfully applied to editor!
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>

              </div>
            </Tabs.Content>

            {/* TAB 2: Custom script Plugins */}
            <Tabs.Content value="plugins" className="space-y-4 outline-none flex-1 overflow-y-auto pr-1">
              
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs font-serif font-bold text-[var(--theme-sidebar-text)]">
                  Active script extensions ({plugins.length})
                </div>
                <button
                  onClick={() => setShowAddPlugin(!showAddPlugin)}
                  className="py-1.5 px-3 bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-soft)] text-white rounded-lg text-[10px] font-bold transition-all hover:scale-[1.02] cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  <Plus size={11} /> Register Plugin
                </button>
              </div>

              {/* Add Custom script plugin form */}
              {showAddPlugin && (
                <div className="p-4 bg-[var(--theme-sidebar-bg)]/40 border border-[var(--theme-paper-border)]/15 rounded-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--theme-sidebar-active-text)]">
                    <FileCode size={14} className="text-purple-400" />
                    <span>Create Markdown Script Extension</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase tracking-wider text-[var(--theme-sidebar-text)] font-mono font-bold">Extension Name</label>
                      <input
                        type="text"
                        placeholder="Plugin name"
                        value={pluginName}
                        onChange={e => setPluginName(e.target.value)}
                        className="w-full bg-[var(--theme-editor-bg)] border border-[var(--theme-paper-border)]/15 px-3 py-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[var(--theme-accent)] text-[var(--theme-editor-text)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase tracking-wider text-[var(--theme-sidebar-text)] font-mono font-bold">Short Description</label>
                      <input
                        type="text"
                        placeholder="Brief description"
                        value={pluginDesc}
                        onChange={e => setPluginDesc(e.target.value)}
                        className="w-full bg-[var(--theme-editor-bg)] border border-[var(--theme-paper-border)]/15 px-3 py-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[var(--theme-accent)] text-[var(--theme-editor-text)]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] uppercase tracking-wider text-[var(--theme-sidebar-text)] font-mono font-bold">JS Lifecycle Code</label>
                    <textarea
                      placeholder={`module.exports = {\n  onRender: function(text) { return text; }\n};`}
                      value={pluginCode}
                      onChange={e => setPluginCode(e.target.value)}
                      className="w-full h-36 bg-[var(--theme-editor-bg)] text-[var(--theme-editor-text)] p-3 border border-[var(--theme-paper-border)]/15 rounded-lg text-[10px] font-mono outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSavePlugin}
                      className="py-1.5 px-4 bg-[var(--theme-accent)] text-white hover:bg-[var(--theme-accent-soft)] rounded-lg text-[11px] font-bold shadow-md transition-colors cursor-pointer"
                    >
                      Save & Enable
                    </button>
                    <button
                      onClick={() => setShowAddPlugin(false)}
                      className="py-1.5 px-4 border border-[var(--theme-paper-border)]/15 text-[var(--theme-sidebar-text)] hover:bg-[var(--theme-sidebar-active-bg)] rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Plugins List */}
              <div className="space-y-3">
                {plugins.map(plugin => (
                  <div
                    key={plugin.id}
                    className="p-4 bg-[var(--theme-sidebar-bg)]/30 border border-[var(--theme-paper-border)]/10 rounded-xl flex items-center justify-between hover:bg-[var(--theme-sidebar-bg)]/50 transition-all duration-200"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[var(--theme-sidebar-active-text)] truncate">{plugin.name}</span>
                        <span className="text-[9px] font-mono bg-[var(--theme-accent)]/10 text-[var(--theme-accent)] px-1.5 py-0.5 rounded-full font-semibold">
                          v{plugin.version}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--theme-sidebar-text)] mt-1 leading-relaxed">
                        {plugin.description}
                      </p>
                      <div className="text-[9px] font-mono text-[var(--theme-sidebar-text)]/40 mt-1">
                        Developer: {plugin.author}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Enabled Toggle */}
                      <label className="flex items-center gap-2 cursor-pointer bg-[var(--theme-sidebar-bg)]/60 px-3 py-1.5 rounded-lg border border-[var(--theme-paper-border)]/10">
                        <input
                          type="checkbox"
                          checked={plugin.enabled}
                          onChange={e => updatePlugin(plugin.id, { enabled: e.target.checked })}
                          className="accent-[var(--theme-accent)]"
                        />
                        <span className="text-[10px] font-mono text-[var(--theme-sidebar-text)] font-semibold">Active</span>
                      </label>

                      {/* Delete Custom Plugins */}
                      {plugin.id !== "plugin-emoji-replacer" && (
                        <button
                          onClick={() => deletePlugin(plugin.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                          title="Delete Plugin"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </Tabs.Content>
          </Tabs.Root>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
