"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeRaw from "rehype-raw";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import CodeBlock from "../../../components/CodeBlock";
import MermaidRenderer from "./MermaidRenderer";
import { useFileStore } from "../../../stores/useFileStore";
import { usePluginStore } from "../../../stores/usePluginStore";
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { Info, AlertTriangle, HelpCircle, CheckCircle, Flame, AlertOctagon } from "lucide-react";
import { cn } from "../../../lib/utils";
import "katex/dist/katex.min.css";

export default function MarkdownPreview() {
  const { files, activeFileId } = useFileStore();
  const { runOnRender } = usePluginStore();
  const { themeMode, previewConfig } = useSettingsStore();

  const activeFile = files.find(f => f.id === activeFileId);

  // Run the plugin pipeline on the text before rendering
  const processedMarkdown = useMemo(() => {
    if (!activeFile || activeFile.type !== "file") return "";
    const source = activeFile.content || "";
    const withPlugins = runOnRender(source);
    // Parse ==text== markdown highlight tags into HTML <mark> tags
    return withPlugins.replace(/==([^=]+)==/g, "<mark>$1</mark>");
  }, [activeFile, runOnRender]);

  // Obsidian-style callout parser inside blockquote rendering
  const customComponents = useMemo(() => {
    return {
      code({ className, children, ...props }: any) {
        const match = /language-(\w+)/.exec(className || "");
        const isBlock = Boolean(match);
        const language = match ? match[1] : "";
        const value = String(children).replace(/\n$/, "");

        if (language === "mermaid") {
          return <MermaidRenderer code={value} />;
        }

        if (!isBlock) {
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        }

        return <CodeBlock language={language} value={value} />;
      },

      blockquote({ children, ...props }: any) {
        // Collect text content to detect Obsidian callouts [!NOTE], [!WARNING], etc.
        const firstParagraph = React.Children.toArray(children)[0] as React.ReactElement;
        
        if (
          firstParagraph &&
          firstParagraph.props &&
          firstParagraph.props.children
        ) {
          const contentArray = React.Children.toArray(firstParagraph.props.children);
          const firstTextNode = contentArray[0];

          if (typeof firstTextNode === "string" && firstTextNode.trim().startsWith("[!")) {
            const match = firstTextNode.trim().match(/^\[!(\w+)\](.*)/);
            if (match) {
              const calloutType = match[1].toLowerCase();
              const remainingText = match[2];

              // Callout configuration mapping
              const calloutConfigs: Record<string, { icon: any; color: string; border: string; bg: string }> = {
                note: { icon: Info, color: "text-blue-500", border: "border-blue-500", bg: "bg-blue-500/5" },
                tip: { icon: Flame, color: "text-amber-500", border: "border-amber-500", bg: "bg-amber-500/5" },
                warning: { icon: AlertTriangle, color: "text-yellow-500", border: "border-yellow-500", bg: "bg-yellow-500/5" },
                important: { icon: AlertOctagon, color: "text-red-500", border: "border-red-500", bg: "bg-red-500/5" },
                success: { icon: CheckCircle, color: "text-emerald-500", border: "border-emerald-500", bg: "bg-emerald-500/5" },
                question: { icon: HelpCircle, color: "text-purple-500", border: "border-purple-500", bg: "bg-purple-500/5" },
              };

              const config = calloutConfigs[calloutType] || calloutConfigs.note;
              const CalloutIcon = config.icon;

              // Modify the first paragraph child to remove the [!NOTE] text prefix
              const modifiedParagraphs = React.Children.map(children, (pChild: any, idx) => {
                if (idx === 0) {
                  return React.cloneElement(pChild, {
                    children: [
                      <span className="font-semibold text-xs inline" key="callout-header">
                        {remainingText}
                      </span>,
                      ...contentArray.slice(1)
                    ]
                  });
                }
                return pChild;
              });

              return (
                <div className={cn("p-4 border-l-4 rounded-r-lg my-4 leading-relaxed text-sm font-sans shadow-sm", config.border, config.bg)}>
                  <div className={cn("flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] mb-1.5", config.color)}>
                    <CalloutIcon size={14} className="shrink-0" />
                    <span>{calloutType}</span>
                  </div>
                  <div className="text-[var(--theme-paper-text)] font-sans opacity-95">{modifiedParagraphs}</div>
                </div>
              );
            }
          }
        }

        return <blockquote className="border-l-4 border-[var(--theme-gold)] pl-4 italic my-4 text-[var(--theme-paper-text)]/80" {...props}>{children}</blockquote>;
      }
    };
  }, [runOnRender]);

  if (!activeFile || activeFile.type !== "file") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--theme-paper-text)]/40 p-8 text-center bg-[var(--theme-paper-bg)]">
        <p className="text-sm font-medium font-serif">No Preview Available</p>
        <p className="text-xs mt-1 max-w-[200px]">Open a file to load its styled manuscript visualization here.</p>
      </div>
    );
  }

  return (
    <div className="preview-scroll h-full overflow-y-auto px-6 py-12 sm:px-14 sm:py-16 paper-texture">
      <article
        className={cn(
          "manuscript ink-in mx-auto max-w-[720px] animate-ink-in",
          previewConfig.previewFont === "serif"
            ? "font-serif"
            : previewConfig.previewFont === "handwriting"
            ? "font-handwriting"
            : previewConfig.previewFont === "mono"
            ? "font-mono"
            : "font-sans"
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[
            rehypeRaw,
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: "wrap" }],
            rehypeKatex,
          ]}
          components={customComponents as any}
        >
          {processedMarkdown}
        </ReactMarkdown>
      </article>
    </div>
  );
}
