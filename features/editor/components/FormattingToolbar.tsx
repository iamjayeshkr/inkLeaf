"use client";

import React from "react";
import { useEditorStore } from "../../../stores/useEditorStore";
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { EditorSelection } from "@codemirror/state";
import { cn } from "../../../lib/utils";
import { undo, redo } from "@codemirror/commands";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Table,
  Image,
  Video,
  Link,
  Quote,
  Minus,
  Binary,
  GitGraph,
  AlertTriangle,
  Smile,
  Undo,
  Redo,
} from "lucide-react";

export default function FormattingToolbar() {
  const { editorView } = useEditorStore();
  const { editorConfig, updateEditorConfig } = useSettingsStore();

  const insertMarkdown = (before: string, after: string = "") => {
    if (!editorView) return;

    const { state } = editorView;
    const { selection } = state;

    editorView.dispatch(
      state.changeByRange(range => {
        const selectedText = state.sliceDoc(range.from, range.to);
        const replacement = before + selectedText + after;
        return {
          changes: { from: range.from, to: range.to, insert: replacement },
          range: EditorSelection.range(
            range.from + before.length,
            range.from + before.length + selectedText.length
          ),
        };
      })
    );
    editorView.focus();
  };

  const insertBlock = (template: string) => {
    if (!editorView) return;

    const { state } = editorView;
    const { selection } = state;
    const mainRange = selection.main;

    // Check if we are at the start of a line
    const line = state.doc.lineAt(mainRange.from);
    const isLineEmpty = line.text.trim() === "";
    const insertPrefix = isLineEmpty ? "" : "\n";

    editorView.dispatch({
      changes: {
        from: mainRange.from,
        to: mainRange.to,
        insert: insertPrefix + template + "\n",
      },
      selection: EditorSelection.single(
        mainRange.from + insertPrefix.length + template.length + 1
      ),
    });
    editorView.focus();
  };

  const insertTable = () => {
    const tableTemplate = `| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |\n| Cell 3 | Cell 4 |`;
    insertBlock(tableTemplate);
  };

  const insertImage = () => {
    if (!editorView) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const base64Url = reader.result as string;
        const { state } = editorView;
        const { selection } = state;
        const mainRange = selection.main;
        editorView.dispatch({
          changes: {
            from: mainRange.from,
            to: mainRange.to,
            insert: `![${file.name}](${base64Url})`
          },
          selection: EditorSelection.single(
            mainRange.from + `![${file.name}](${base64Url})`.length
          )
        });
        editorView.focus();
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleUndo = () => {
    if (editorView) {
      undo(editorView);
      editorView.focus();
    }
  };

  const handleRedo = () => {
    if (editorView) {
      redo(editorView);
      editorView.focus();
    }
  };

  const toolbarButtons = [
    { icon: Undo, title: "Undo (Ctrl+Z)", action: handleUndo },
    { icon: Redo, title: "Redo (Ctrl+Y)", action: handleRedo },
    { type: "divider" },
    { icon: Heading1, title: "Heading 1", action: () => insertMarkdown("# ", "\n") },
    { icon: Heading2, title: "Heading 2", action: () => insertMarkdown("## ", "\n") },
    { icon: Heading3, title: "Heading 3", action: () => insertMarkdown("### ", "\n") },
    { type: "divider" },
    { icon: Bold, title: "Bold (Ctrl+B)", action: () => insertMarkdown("**", "**") },
    { icon: Italic, title: "Italic (Ctrl+I)", action: () => insertMarkdown("*", "*") },
    { icon: Underline, title: "Underline", action: () => insertMarkdown("<u>", "</u>") },
    { icon: Strikethrough, title: "Strikethrough", action: () => insertMarkdown("~~", "~~") },
    { icon: Highlighter, title: "Highlight", action: () => insertMarkdown("==", "==") },
    { icon: Code, title: "Inline Code", action: () => insertMarkdown("`", "`") },
    { type: "divider" },
    { icon: List, title: "Bullet List", action: () => insertMarkdown("- ") },
    { icon: ListOrdered, title: "Numbered List", action: () => insertMarkdown("1. ") },
    { icon: CheckSquare, title: "Task List", action: () => insertMarkdown("- [ ] ") },
    { type: "divider" },
    { icon: Link, title: "Insert Link", action: () => insertMarkdown("[", "](https://)") },
    { icon: Image, title: "Insert Image", action: insertImage },
    { icon: Table, title: "Insert Table", action: insertTable },
    { icon: Quote, title: "Blockquote", action: () => insertMarkdown("> ") },
    { icon: Minus, title: "Horizontal Rule", action: () => insertBlock("---") },
    { type: "divider" },
    {
      icon: Binary,
      title: "Math Block",
      action: () => insertBlock("$$\n\\int_{a}^{b} f(x) dx\n$$"),
    },
    {
      icon: GitGraph,
      title: "Mermaid Diagram",
      action: () =>
        insertBlock("```mermaid\ngraph TD\n    A[Start] --> B[Process]\n    B --> C[End]\n```"),
    },
    {
      icon: AlertTriangle,
      title: "Info Callout",
      action: () => insertBlock("> [!NOTE]\n> Enter text here"),
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-1.5 bg-[var(--theme-sidebar-bg)] overflow-x-auto select-none">
      {toolbarButtons.map((btn, index) => {
        if (btn.type === "divider") {
          return (
            <div
              key={`div-${index}`}
              className="h-4 w-px bg-transparent mx-1"
            />
          );
        }

        const Icon = btn.icon!;
        return (
          <button
            key={`btn-${index}`}
            onClick={btn.action}
            disabled={!editorView}
            className="p-1 rounded hover:bg-[var(--theme-sidebar-active-bg)] text-[var(--theme-sidebar-text)]/75 hover:text-[var(--theme-sidebar-active-text)] disabled:opacity-30 transition-colors cursor-pointer"
            title={btn.title}
          >
            <Icon size={14} />
          </button>
        );
      })}

      {/* Font Size Selector for Google-like feel */}
      <div className="ml-auto flex items-center gap-1">
        <button
          onClick={() => updateEditorConfig({ fontSize: Math.max(10, editorConfig.fontSize - 1) })}
          className="px-1.5 py-0.5 rounded text-[10px] hover:bg-[var(--theme-sidebar-active-bg)] text-[var(--theme-sidebar-text)] font-semibold bg-[var(--theme-sidebar-active-bg)]/40 hover:bg-[var(--theme-sidebar-active-bg)]/80"
          title="Decrease font size"
        >
          A-
        </button>
        <span className="text-[10px] font-mono w-5 text-center text-[var(--theme-sidebar-text)] font-semibold">
          {editorConfig.fontSize}
        </span>
        <button
          onClick={() => updateEditorConfig({ fontSize: Math.min(24, editorConfig.fontSize + 1) })}
          className="px-1.5 py-0.5 rounded text-[10px] hover:bg-[var(--theme-sidebar-active-bg)] text-[var(--theme-sidebar-text)] font-semibold bg-[var(--theme-sidebar-active-bg)]/40 hover:bg-[var(--theme-sidebar-active-bg)]/80"
          title="Increase font size"
        >
          A+
        </button>
        <span className="h-4 w-px bg-transparent mx-1" />
        <button
          onClick={() => updateEditorConfig({ typewriterMode: !editorConfig.typewriterMode })}
          className={cn(
            "px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors bg-[var(--theme-sidebar-active-bg)]/40 text-[var(--theme-sidebar-text)]",
            editorConfig.typewriterMode
              ? "bg-[var(--theme-accent)] text-white font-bold"
              : "hover:bg-[var(--theme-sidebar-active-bg)]/80"
          )}
          title="Typewriter scroll mode"
        >
          Typewriter
        </button>
        <button
          onClick={() => updateEditorConfig({ focusMode: !editorConfig.focusMode })}
          className={cn(
            "px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors bg-[var(--theme-sidebar-active-bg)]/40 text-[var(--theme-sidebar-text)]",
            editorConfig.focusMode
              ? "bg-[var(--theme-accent)] text-white font-bold"
              : "hover:bg-[var(--theme-sidebar-active-bg)]/80"
          )}
          title="Focus line highlights"
        >
          Focus
        </button>
      </div>
    </div>
  );
}
