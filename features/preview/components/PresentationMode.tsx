"use client";

import React, { useState, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeRaw from "rehype-raw";
import CodeBlock from "../../../components/CodeBlock";
import MermaidRenderer from "./MermaidRenderer";
import { useFileStore } from "../../../stores/useFileStore";
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2, Palette } from "lucide-react";
import { cn } from "../../../lib/utils";
import "katex/dist/katex.min.css";

export default function PresentationMode() {
  const { files, activeFileId } = useFileStore();
  const { updatePreviewConfig } = useSettingsStore();
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [slideTheme, setSlideTheme] = useState<"app" | "dark" | "light" | "sepia">("app");

  const activeFile = files.find(f => f.id === activeFileId);

  // Split markdown content by horizontal rule separators (e.g. ---)
  const slides = useMemo(() => {
    if (!activeFile || activeFile.type !== "file" || !activeFile.content) return [];
    
    // Split on lines containing only '---' (with optional spaces)
    const content = activeFile.content;
    const parts = content.split(/\n\s*---\s*\n/);
    return parts.filter(slide => slide.trim() !== "");
  }, [activeFile]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setCurrentSlide(curr => Math.min(slides.length - 1, curr + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentSlide(curr => Math.max(0, curr - 1));
      } else if (e.key === "Escape") {
        updatePreviewConfig({ presentationMode: false });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length, updatePreviewConfig]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const cycleTheme = () => {
    if (slideTheme === "app") setSlideTheme("dark");
    else if (slideTheme === "dark") setSlideTheme("light");
    else if (slideTheme === "light") setSlideTheme("sepia");
    else setSlideTheme("app");
  };

  if (slides.length === 0) return null;

  const activeSlideContent = slides[currentSlide];

  const themeStyles = {
    app: {
      bg: "bg-[var(--theme-editor-bg)]",
      text: "text-[var(--theme-editor-text)]",
      headerBg: "bg-[var(--theme-sidebar-bg)]/80 border-[var(--theme-paper-border)]/15",
      buttonHover: "hover:bg-[var(--theme-sidebar-active-bg)] text-[var(--theme-sidebar-text)] hover:text-[var(--theme-sidebar-active-text)]",
      buttonBorder: "border-[var(--theme-paper-border)]/20",
      prose: "prose-stone dark:prose-invert",
      codeBg: "bg-[var(--theme-sidebar-bg)] text-[var(--theme-accent)]",
      progressBg: "bg-[var(--theme-paper-border)]/25",
      progressFill: "bg-[var(--theme-accent)]",
      infoText: "text-[var(--theme-sidebar-text)]/40",
    },
    dark: {
      bg: "bg-[#0B0D12]",
      text: "text-[#E4E6EA]",
      headerBg: "bg-black/30 border-white/5",
      buttonHover: "hover:bg-white/5 text-white/70 hover:text-white",
      buttonBorder: "border-white/10",
      prose: "prose-invert",
      codeBg: "bg-white/10 text-yellow-300",
      progressBg: "bg-white/10",
      progressFill: "bg-[var(--theme-accent,#3D5AFE)]",
      infoText: "text-white/30",
    },
    light: {
      bg: "bg-[#FBF8F1]",
      text: "text-[#1C1917]",
      headerBg: "bg-black/5 border-black/5",
      buttonHover: "hover:bg-black/5 text-black/70 hover:text-black",
      buttonBorder: "border-black/10",
      prose: "prose-stone",
      codeBg: "bg-black/5 text-amber-700",
      progressBg: "bg-black/10",
      progressFill: "bg-[var(--theme-accent,#3D5AFE)]",
      infoText: "text-black/30",
    },
    sepia: {
      bg: "bg-[#F4ECD8]",
      text: "text-[#433422]",
      headerBg: "bg-[#2B1B0F]/5 border-[#2B1B0F]/5",
      buttonHover: "hover:bg-[#2B1B0F]/5 text-[#433422]/70 hover:text-[#433422]",
      buttonBorder: "border-[#2B1B0F]/10",
      prose: "prose-sepia",
      codeBg: "bg-[#2B1B0F]/5 text-amber-800",
      progressBg: "bg-[#2B1B0F]/10",
      progressFill: "bg-[var(--theme-accent,#3D5AFE)]",
      infoText: "text-[#433422]/40",
    },
  };

  const currentTheme = themeStyles[slideTheme];

  const styleVars = slideTheme === "app" ? {} : {
    "--theme-paper-text": slideTheme === "dark" ? "#ffffff" : "#1c1917",
    "--theme-gold": slideTheme === "dark" ? "#ffffff" : "#c9a227",
    "--theme-sidebar-bg": slideTheme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
    "--theme-paper-border": slideTheme === "dark" ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)",
  };

  return (
    <div
      style={styleVars as React.CSSProperties}
      className={cn(
        "fixed inset-0 z-50 flex flex-col select-none font-sans animate-fade-in transition-colors duration-300",
        currentTheme.bg,
        currentTheme.text
      )}
    >
      
      {/* Top Controls Row */}
      <header className={cn("flex h-12 items-center justify-between px-6 border-b backdrop-blur-md transition-colors", currentTheme.headerBg)}>
        <div className="flex items-center gap-2">
          <span className="font-serif text-xs tracking-wider uppercase opacity-50">Slide {currentSlide + 1} of {slides.length}</span>
          <span className="h-3 w-px bg-current opacity-10" />
          <span className="text-xs truncate font-mono opacity-80">{activeFile?.name}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={cycleTheme}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded transition-colors cursor-pointer text-xs font-mono border",
              currentTheme.buttonHover,
              currentTheme.buttonBorder
            )}
            title="Change Slide Theme (Dark / Light / Sepia)"
          >
            <Palette size={13} />
            <span className="capitalize">{slideTheme}</span>
          </button>
          
          <button
            onClick={toggleFullscreen}
            className={cn("p-2 rounded transition-colors cursor-pointer", currentTheme.buttonHover)}
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            onClick={() => updatePreviewConfig({ presentationMode: false })}
            className="p-2 rounded hover:bg-red-500/20 text-red-500 hover:text-red-400 transition-colors cursor-pointer"
            title="Exit Presentation (Esc)"
          >
            <X size={14} />
          </button>
        </div>
      </header>

      {/* Slide Display Container */}
      <div className="flex-1 flex flex-col p-8 md:p-16 overflow-y-auto">
        <article className={cn(
          "my-auto manuscript text-center mx-auto max-w-4xl prose prose-lg [&>h1]:text-4xl [&>h1]:border-b-0 [&>h1]:text-center [&>h1]:mb-6 [&>p]:text-xl [&>ul]:text-left [&>ul]:inline-block [&>ol]:text-left [&>ol]:inline-block leading-relaxed transition-colors",
          currentTheme.prose
        )}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeRaw, rehypeSlug, rehypeKatex]}
            components={{
              code({ className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                const isBlock = Boolean(match);
                const language = match ? match[1] : "";
                const value = String(children).replace(/\n$/, "");

                if (language === "mermaid") {
                  return <MermaidRenderer code={value} />;
                }

                if (!isBlock) {
                  return <code className={cn("px-1 py-0.5 rounded font-mono text-sm", currentTheme.codeBg)}>{children}</code>;
                }

                return <CodeBlock language={language} value={value} />;
              }
            }}
          >
            {activeSlideContent}
          </ReactMarkdown>
        </article>
      </div>

      {/* Bottom Nav Row */}
      <footer className={cn("flex h-14 items-center justify-between px-8 border-t transition-colors", currentTheme.headerBg)}>
        <div className={cn("text-[10px] font-mono", currentTheme.infoText)}>
          Navigate: Left/Right Arrows or Space
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={currentSlide === 0}
            onClick={() => setCurrentSlide(c => Math.max(0, c - 1))}
            className={cn("p-2 rounded transition-colors bg-current bg-opacity-5 disabled:opacity-20 cursor-pointer", currentTheme.buttonHover)}
          >
            <ChevronLeft size={16} />
          </button>
          
          {/* Progress bar */}
          <div className={cn("w-48 h-1 rounded-full overflow-hidden hidden sm:block", currentTheme.progressBg)}>
            <div
              style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
              className={cn("h-full transition-all duration-300", currentTheme.progressFill)}
            />
          </div>

          <button
            disabled={currentSlide === slides.length - 1}
            onClick={() => setCurrentSlide(c => Math.min(slides.length - 1, c + 1))}
            className={cn("p-2 rounded transition-colors bg-current bg-opacity-5 disabled:opacity-20 cursor-pointer", currentTheme.buttonHover)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </footer>
    </div>
  );
}
