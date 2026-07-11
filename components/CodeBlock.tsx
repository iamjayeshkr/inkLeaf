"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";

export default function CodeBlock({
  language,
  value,
}: {
  language: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="code-block-wrap group">
      <span className="code-lang-tag">{language || "text"}</span>
      <button
        onClick={handleCopy}
        aria-label="Copy code"
        className="absolute top-2 right-2 mt-6 flex items-center gap-1.5 rounded-md border border-white/10 bg-black/40 px-2 py-1 text-[11px] text-ink-200 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 hover:border-white/25 hover:text-white"
      >
        {copied ? (
          <>
            <Check size={12} /> copied
          </>
        ) : (
          <>
            <Copy size={12} /> copy
          </>
        )}
      </button>
      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        showLineNumbers={value.split("\n").length > 1}
        codeTagProps={{
          style: {
            fontFamily: "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          }
        }}
        customStyle={{
          margin: 0,
          padding: "2rem 1rem 1rem",
          background: "#11151E",
          fontSize: "0.85rem",
          lineHeight: 1.6,
          fontFamily: "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          textAlign: "left",
        }}
        lineNumberStyle={{ color: "#3A4152", minWidth: "2.25em" }}
      >
        {value.replace(/\n$/, "")}
      </SyntaxHighlighter>
    </div>
  );
}
