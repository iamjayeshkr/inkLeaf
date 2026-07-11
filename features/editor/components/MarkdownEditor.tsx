"use client";

import React, { useMemo, useEffect, useRef } from "react";
import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView } from "@codemirror/view";
import { useFileStore } from "../../../stores/useFileStore";
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { useEditorStore } from "../../../stores/useEditorStore";
import { cn } from "../../../lib/utils";
import AIAssistant from "../../../components/ui/AIAssistant";

export default function MarkdownEditor() {
  const { files, activeFileId, updateFileContent } = useFileStore();
  const { editorConfig } = useSettingsStore();
  const { setEditorView } = useEditorStore();

  const activeFile = files.find(f => f.id === activeFileId);
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  // Focus editor on tab switch
  useEffect(() => {
    if (activeFileId && editorRef.current?.view) {
      editorRef.current.view.focus();
    }
  }, [activeFileId]);

  // Cleanup view on unmount
  useEffect(() => {
    return () => {
      setEditorView(null);
    };
  }, [setEditorView]);


  const handleChange = (val: string) => {
    if (activeFileId) {
      updateFileContent(activeFileId, val);
    }
  };

  // Custom theme overrides for CodeMirror 6 using active variables
  const codeMirrorTheme = useMemo(() => {
    return EditorView.theme(
      {
        "&": {
          color: "var(--theme-editor-text, #E4E6EA)",
          backgroundColor: "var(--theme-editor-bg, #0B0D12)",
          fontSize: `${editorConfig.fontSize}px`,
          fontFamily: "var(--font-mono), monospace",
          height: "100%",
        },
        ".cm-scroller": {
          overflowY: "auto",
        },
        ".cm-content": {
          caretColor: "var(--theme-editor-cursor, #C9A227)",
          padding: "2.5rem 1.5rem",
          maxWidth: editorConfig.distractionFree ? "720px" : "100%",
          margin: editorConfig.distractionFree ? "0 auto" : "0",
          lineHeight: "1.8",
        },
        ".cm-line": {
          paddingLeft: "10px",
          paddingRight: "10px",
        },
        ".cm-cursor, .cm-dropCursor": {
          borderLeft: "2px solid var(--theme-editor-cursor, #C9A227)",
        },
        "&.cm-focused .cm-cursor": {
          borderLeft: "2px solid var(--theme-editor-cursor, #C9A227)",
        },
        ".cm-gutters": {
          backgroundColor: "var(--theme-editor-bg, #0B0D12)",
          color: "var(--theme-editor-line-numbers, #3A4152)",
          borderRight: "none",
          paddingLeft: "10px",
          opacity: 0.4,
        },
        ".cm-activeLine": {
          backgroundColor: "rgba(255, 255, 255, 0.03)",
        },
        ".cm-activeLineGutter": {
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          color: "var(--theme-accent, #3D5AFE)",
          opacity: 1,
        },
        ".cm-selectionBackground": {
          backgroundColor: "var(--theme-accent-soft, rgba(61, 90, 254, 0.25)) !important",
        },
        "&.cm-focused .cm-selectionBackground": {
          backgroundColor: "var(--theme-accent-soft, rgba(61, 90, 254, 0.25)) !important",
        },
        ".cm-foldPlaceholder": {
          background: "rgba(128, 128, 128, 0.1)",
          border: "none",
          color: "var(--theme-accent)",
          padding: "0 4px",
        },
        // Markdown headers formatting inside editor
        ".cm-header-1": { fontSize: "1.6em", fontWeight: "bold", color: "var(--theme-editor-text)" },
        ".cm-header-2": { fontSize: "1.3em", fontWeight: "bold", color: "var(--theme-editor-text)" },
        ".cm-header-3": { fontSize: "1.15em", fontWeight: "bold", color: "var(--theme-editor-text)" },
      },
      { dark: true }
    );
  }, [editorConfig.fontSize, editorConfig.distractionFree]);

  // CodeMirror Extensions configuration
  const cmExtensions = useMemo(() => {
    const exts = [
      markdown({
        codeLanguages: languages,
      }),
      codeMirrorTheme,
      EditorView.lineWrapping,
    ];

    // Typewriter scroll margin (Locks cursor to screen center)
    if (editorConfig.typewriterMode) {
      exts.push(
        EditorView.scrollMargins.of(view => {
          const height = view.dom.clientHeight;
          const offset = height / 2.5;
          return { top: offset, bottom: offset };
        })
      );
    }

    return exts;
  }, [editorConfig.typewriterMode, codeMirrorTheme]);

  if (!activeFile || activeFile.type !== "file") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--theme-sidebar-text)]/40 p-8 text-center bg-[var(--theme-editor-bg)]">
        <p className="text-sm font-medium font-serif">No file active</p>
        <p className="text-xs mt-1 max-w-[200px]">Create a new file in the explorer or open a tab to start drafting.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-full w-full relative transition-all duration-300",
        editorConfig.focusMode ? "cm-focus-mode-active" : ""
      )}
    >
      <CodeMirror
        ref={editorRef}
        value={activeFile.content || ""}
        onChange={handleChange}
        theme="none" // Controlled via our custom css classes
        extensions={cmExtensions}
        onCreateEditor={(view) => setEditorView(view)}
        basicSetup={{
          lineNumbers: editorConfig.lineNumbers,
          foldGutter: editorConfig.codeFolding,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          highlightActiveLine: true,
          highlightActiveLineGutter: true,
        }}
        className="h-full w-full [&>.cm-editor]:h-full"
      />

      <AIAssistant />

      <style jsx global>{`
        /* Focus Mode Styles */
        .cm-focus-mode-active .cm-line {
          opacity: 0.25;
          filter: blur(0.3px);
          transition: opacity 0.25s ease, filter 0.25s ease;
        }
        .cm-focus-mode-active .cm-activeLine {
          opacity: 1;
          filter: none;
        }
      `}</style>
    </div>
  );
}
