import React, { useRef, useEffect, useState } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from "@codemirror/view";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldGutter, foldKeymap } from "@codemirror/language";

interface CodeEditorProps {
  value: string;
  language: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  // theme?: 'light' | 'dark' | 'vs-code'; // Now handled internally
}

const languageExtensions = {
  javascript: javascript(),
  python: python(),
  cpp: cpp(),
  java: java(),
  js: javascript(),
  py: python(),
  c: cpp(),
  cxx: cpp(),
  hpp: cpp(),
  h: cpp(),
};

// VS Code-like dark theme
const vsCodeDarkTheme = EditorView.theme({
  "&": {
    fontSize: "14px",
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'Courier New', monospace",
    height: "100%",
    background: "#1e1e1e",
    color: "#d4d4d4",
  },
  ".cm-scroller": {
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'Courier New', monospace",
  },
  ".cm-content": {
    padding: "12px 0",
    minHeight: "300px",
    caretColor: "#d4d4d4",
  },
  ".cm-line": {
    lineHeight: "1.6",
    padding: "0 12px",
  },
  ".cm-activeLine": {
    backgroundColor: "#2a2d2e",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "#2a2d2e",
    color: "#d4d4d4",
  },
  ".cm-gutters": {
    backgroundColor: "#1e1e1e",
    color: "#858585",
    border: "none",
    paddingRight: "8px",
  },
  ".cm-lineNumbers": {
    color: "#858585",
  },
  ".cm-cursor": {
    borderLeft: "2px solid #d4d4d4",
  },
  ".cm-selectionBackground": {
    backgroundColor: "#264f78",
  },
  ".cm-selectionMatch": {
    backgroundColor: "#264f78",
  },
  // Syntax highlighting colors (VS Code dark theme)
  ".cm-keyword": { color: "#569cd6" },
  ".cm-operator": { color: "#d4d4d4" },
  ".cm-variable": { color: "#9cdcfe" },
  ".cm-variable-2": { color: "#9cdcfe" },
  ".cm-variableName": { color: "#9cdcfe" },
  ".cm-def": { color: "#dcdcaa" },
  ".cm-property": { color: "#9cdcfe" },
  ".cm-comment": { color: "#6a9955", fontStyle: "italic" },
  ".cm-string": { color: "#ce9178" },
  ".cm-string-2": { color: "#ce9178" },
  ".cm-number": { color: "#b5cea8" },
  ".cm-atom": { color: "#569cd6" },
  ".cm-meta": { color: "#d4d4d4" },
  ".cm-tag": { color: "#569cd6" },
  ".cm-attribute": { color: "#9cdcfe" },
  ".cm-qualifier": { color: "#d7ba7d" },
  ".cm-builtin": { color: "#569cd6" },
  ".cm-bracket": { color: "#ffd700" },
  ".cm-punctuation": { color: "#d4d4d4" },
  ".cm-formatting": { color: "#d4d4d4" },
  // Fold gutter
  ".cm-foldGutter": {
    color: "#858585",
  },
  ".cm-foldGutter .cm-gutterElement": {
    padding: "0 0.2em",
    cursor: "pointer",
  },
  ".cm-foldGutter .cm-gutterElement:hover": {
    backgroundColor: "#2a2d2e",
  },
  // Scrollbar styling
  ".cm-scroller::-webkit-scrollbar": {
    width: "8px",
    height: "8px",
  },
  ".cm-scroller::-webkit-scrollbar-track": {
    backgroundColor: "#1e1e1e",
  },
  ".cm-scroller::-webkit-scrollbar-thumb": {
    backgroundColor: "#424242",
    borderRadius: "4px",
  },
  ".cm-scroller::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "#4f4f4f",
  },
}, { dark: true });

// Light theme
const lightTheme = EditorView.theme({
  "&": {
    fontSize: "14px",
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'Courier New', monospace",
    height: "100%",
    background: "#fff",
    color: "#000",
  },
  ".cm-scroller": {
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'Courier New', monospace",
  },
  ".cm-content": {
    padding: "12px 0",
    minHeight: "300px",
    caretColor: "#000000",
  },
  ".cm-line": {
    lineHeight: "1.6",
    padding: "0 12px",
  },
  ".cm-activeLine": {
    backgroundColor: "#f0f0f0",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "#f0f0f0",
    color: "#000000",
  },
  ".cm-gutters": {
    backgroundColor: "#f5f5f5",
    color: "#666666",
    border: "none",
    paddingRight: "8px",
  },
  ".cm-lineNumbers": {
    color: "#666666",
  },
  ".cm-cursor": {
    borderLeft: "2px solid #000000",
  },
  ".cm-selectionBackground": {
    backgroundColor: "#add6ff",
  },
  ".cm-selectionMatch": {
    backgroundColor: "#add6ff",
  },
  // Syntax highlighting colors (light theme)
  ".cm-keyword": { color: "#0000ff" },
  ".cm-operator": { color: "#000000" },
  ".cm-variable": { color: "#001080" },
  ".cm-variable-2": { color: "#001080" },
  ".cm-variableName": { color: "#001080" },
  ".cm-def": { color: "#795e26" },
  ".cm-property": { color: "#001080" },
  ".cm-comment": { color: "#008000", fontStyle: "italic" },
  ".cm-string": { color: "#a31515" },
  ".cm-string-2": { color: "#a31515" },
  ".cm-number": { color: "#098658" },
  ".cm-atom": { color: "#0000ff" },
  ".cm-meta": { color: "#000000" },
  ".cm-tag": { color: "#0000ff" },
  ".cm-attribute": { color: "#001080" },
  ".cm-qualifier": { color: "#795e26" },
  ".cm-builtin": { color: "#0000ff" },
  ".cm-bracket": { color: "#000000" },
  ".cm-punctuation": { color: "#000000" },
  ".cm-formatting": { color: "#000000" },
}, { dark: false });

export default function CodeEditor({ 
  value, 
  language, 
  onChange, 
  placeholder = "// Write your code here",
  readOnly = false,
  className = ""
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [theme, setTheme] = useState<'vs-code' | 'light'>('vs-code');

  useEffect(() => {
    if (!editorRef.current) return;

    // Destroy existing view if it exists
    if (viewRef.current) {
      viewRef.current.destroy();
    }

    const state = EditorState.create({
      doc: value || placeholder,
      extensions: [
        // Language support
        languageExtensions[language as keyof typeof languageExtensions] || javascript(),
        
        // Syntax highlighting
        syntaxHighlighting(defaultHighlightStyle),
        
        // Advanced features
        bracketMatching(),
        foldGutter(),
        
        // Line numbers and active line highlighting
        highlightActiveLineGutter(),
        highlightActiveLine(),
        
        // Special characters and selection
        highlightSpecialChars(),
        drawSelection(),
        dropCursor(),
        rectangularSelection(),
        crosshairCursor(),
        
        // Keymaps
        keymap.of([
          ...defaultKeymap,
          ...foldKeymap,
          indentWithTab,
        ]),
        
        // Theme
        theme === "vs-code" ? vsCodeDarkTheme : lightTheme,
        
        // Update listener
        EditorView.updateListener.of((update) => {
          if (update.changes && onChange) {
            onChange(update.state.doc.toString());
          }
        }),
        
        // Read-only mode
        readOnly ? EditorView.editable.of(false) : [],
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [language, readOnly, theme]); // Re-initialize if language, readOnly, or theme changes

  // Update content when value prop changes (but not from internal changes)
  useEffect(() => {
    if (viewRef.current && value !== viewRef.current.state.doc.toString()) {
      const transaction = viewRef.current.state.update({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value || placeholder,
        },
      });
      viewRef.current.dispatch(transaction);
    }
  }, [value, placeholder]);

  // Theme toggle button handler
  const handleThemeToggle = () => {
    setTheme((prev) => (prev === 'vs-code' ? 'light' : 'vs-code'));
  };

  return (
    <div className={`relative border border-border rounded-md overflow-hidden bg-background ${className}`} style={{ minHeight: "300px" }}>
      {/* Theme toggle button */}
      <button
        type="button"
        onClick={handleThemeToggle}
        className="absolute top-2 right-2 z-10 px-2 py-1 rounded bg-gray-800 text-white text-xs shadow hover:bg-gray-700 focus:outline-none focus:ring"
        title="Toggle theme"
      >
        {theme === 'vs-code' ? '🌙' : '☀️'}
      </button>
      <div ref={editorRef} className="h-full" />
    </div>
  );
} 