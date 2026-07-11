"use client";

import React, { useState, useEffect } from "react";
import { usePluginStore } from "../../stores/usePluginStore";
import { useEditorStore } from "../../stores/useEditorStore";
import { generateAICopilotText } from "../../lib/ai";
import { Sparkles, X, ChevronRight, Check, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "../../lib/utils";

export default function AIAssistant() {
  const { aiConfigs } = usePluginStore();
  const { editorView } = useEditorStore();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("ollama");
  const [prompt, setPrompt] = useState("");
  const [useContext, setUseContext] = useState(true);
  const [contextText, setContextText] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Retrieve current selection context on open or cursor change
  useEffect(() => {
    if (isOpen && editorView) {
      const { state } = editorView;
      const { selection } = state;
      const selected = state.sliceDoc(selection.main.from, selection.main.to);
      setContextText(selected);
      if (!selected) {
        setUseContext(false);
      } else {
        setUseContext(true);
      }
    }
  }, [isOpen, editorView]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult("");

    try {
      const config = aiConfigs[selectedProvider];
      if (!config) {
        throw new Error("Selected provider configuration not found.");
      }

      // Execute AI generation
      const generated = await generateAICopilotText(
        config,
        prompt.trim(),
        useContext ? contextText : ""
      );

      setResult(generated);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during generation.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsert = () => {
    if (!editorView || !result) return;
    const { state } = editorView;
    const { selection } = state;

    editorView.dispatch({
      changes: {
        from: selection.main.from,
        to: selection.main.to,
        insert: result,
      },
      selection: { anchor: selection.main.from + result.length },
    });
    editorView.focus();
    setIsOpen(false);
    setPrompt("");
    setResult("");
  };

  if (!editorView) return null;

  return (
    <div className="absolute bottom-4 right-4 z-30 flex flex-col items-end">
      {/* 1. Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-soft)] text-white shadow-lg transition-all hover:scale-105 cursor-pointer font-serif text-xs font-semibold select-none border border-[var(--theme-paper-border)]/10"
          title="Open AI Writing Assistant"
        >
          <Sparkles size={14} className="animate-pulse" />
          <span>AI Assist</span>
        </button>
      )}

      {/* 2. Assistant Panel Card */}
      {isOpen && (
        <div className="w-[320px] sm:w-[360px] rounded-xl border border-[var(--theme-paper-border)]/20 bg-[var(--theme-editor-bg)]/95 backdrop-blur shadow-2xl p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-3 duration-150 select-none">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--theme-paper-border)]/10 pb-2">
            <span className="flex items-center gap-1.5 text-xs font-serif font-bold text-[var(--theme-sidebar-active-text)]">
              <Sparkles size={14} className="text-[var(--theme-accent)]" />
              AI Markdown Copilot
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
                setError(null);
              }}
              className="p-1 rounded hover:bg-[var(--theme-sidebar-active-bg)] text-[var(--theme-sidebar-text)]/60 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Model Selection Row */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <label className="text-[var(--theme-sidebar-text)] font-semibold">LLM Engine</label>
            <select
              value={selectedProvider}
              onChange={e => {
                setSelectedProvider(e.target.value);
                setError(null);
              }}
              className="bg-[var(--theme-sidebar-bg)] border border-[var(--theme-paper-border)]/15 rounded-lg px-2 py-1 text-xs outline-none text-[var(--theme-sidebar-active-text)] cursor-pointer font-mono"
            >
              <option value="ollama">Ollama (Qwen 2.5)</option>
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI GPT</option>
              <option value="claude">Anthropic Claude</option>
            </select>
          </div>

          {/* Selection Context Indicator */}
          {contextText && (
            <label className="flex items-center gap-2 p-1.5 bg-[var(--theme-sidebar-bg)]/40 border border-[var(--theme-paper-border)]/10 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={useContext}
                onChange={e => setUseContext(e.target.checked)}
                className="accent-[var(--theme-accent)]"
              />
              <span className="text-[10px] text-[var(--theme-sidebar-text)] truncate max-w-[280px]">
                Feed active selection ({contextText.length} chars) as context
              </span>
            </label>
          )}

          {/* Prompt Input */}
          <div className="space-y-1">
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="E.g., Write a 3-bullet summary of the selected text, or draft an outline for a presentation..."
              rows={3}
              className="w-full bg-[var(--theme-sidebar-bg)] border border-[var(--theme-paper-border)]/15 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-[var(--theme-accent)] placeholder:text-[var(--theme-sidebar-text)]/40 font-sans resize-none text-[var(--theme-editor-text)]"
            />
          </div>

          {/* Action Trigger */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="w-full py-1.5 rounded-lg bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-soft)] disabled:opacity-40 text-white font-serif font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw size={12} className="animate-spin" />
                <span>Consulting Qwen / LLM...</span>
              </>
            ) : (
              <>
                <Sparkles size={12} />
                <span>Generate Markdown</span>
              </>
            )}
          </button>

          {/* Result Output Preview */}
          {result && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <div className="text-[9px] uppercase tracking-wider text-[var(--theme-sidebar-text)] font-mono font-semibold">
                Generated Markdown:
              </div>
              <textarea
                value={result}
                onChange={e => setResult(e.target.value)}
                rows={5}
                className="w-full bg-[var(--theme-sidebar-bg)]/80 border border-[var(--theme-paper-border)]/15 rounded-lg p-2.5 text-xs font-mono outline-none focus:ring-1 focus:ring-[var(--theme-accent)] text-[var(--theme-editor-text)]"
              />
              <button
                onClick={handleInsert}
                className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-serif font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Check size={13} />
                <span>Insert Into Document</span>
              </button>
            </div>
          )}

          {/* Error Indicator */}
          {error && (
            <div className="flex items-start gap-1.5 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] text-red-500 font-mono">
              <AlertCircle size={13} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
