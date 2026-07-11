import { create } from "zustand";
import { EditorView } from "@codemirror/view";

interface EditorState {
  editorView: EditorView | null;
  setEditorView: (view: EditorView | null) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  editorView: null,
  setEditorView: (view) => set({ editorView: view }),
}));
