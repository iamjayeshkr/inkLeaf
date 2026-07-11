"use client";

import React, { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw, AlertCircle, Download } from "lucide-react";

interface MermaidRendererProps {
  code: string;
}

export default function MermaidRenderer({ code }: MermaidRendererProps) {
  const [svgContent, setSvgContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    const renderMermaid = async () => {
      try {
        setError(null);
        const { default: mermaid } = await import("mermaid");
        
        // Setup configuration matching current theme
        const isDark = document.documentElement.classList.contains("dark") || 
                       getComputedStyle(document.documentElement).getPropertyValue("--theme-bg").trim() === "#121212";

        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? "dark" : "neutral",
          securityLevel: "loose",
          themeVariables: {
            background: "transparent",
          }
        });

        const elementId = `mermaid-svg-${Math.floor(Math.random() * 100000)}`;
        
        // Parse and render the code block
        const { svg } = await mermaid.render(elementId, code);
        
        if (active) {
          setSvgContent(svg);
        }
      } catch (err: any) {
        console.error("Mermaid Render Error:", err);
        if (active) {
          setError(err.message || "Failed to render Mermaid diagram. Check your syntax.");
        }
      }
    };

    renderMermaid();

    return () => {
      active = false;
    };
  }, [code]);

  // Zoom handlers
  const handleZoomIn = () => setZoom(z => Math.min(3, z + 0.15));
  const handleZoomOut = () => setZoom(z => Math.max(0.5, z - 0.15));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Drag pan handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return; // Only left click drag
    isDragging.current = true;
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    if (containerRef.current) {
      containerRef.current.style.cursor = "grabbing";
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    if (containerRef.current) {
      containerRef.current.style.cursor = "grab";
    }
  };

  const exportSvg = () => {
    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diagram-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 border border-red-500/20 bg-red-500/5 rounded-lg text-red-500 my-4 text-xs font-mono">
        <div className="flex items-center gap-1.5 font-bold mb-1">
          <AlertCircle size={14} />
          <span>Diagram Render Error</span>
        </div>
        <p className="opacity-90 max-w-full overflow-x-auto whitespace-pre-wrap">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative group border border-[var(--theme-paper-border)]/20 bg-[var(--theme-editor-bg)]/10 rounded-lg my-6 overflow-hidden">
      
      {/* Controls HUD */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--theme-sidebar-bg)] p-1 rounded-md border border-[var(--theme-paper-border)]/20 shadow-sm">
        <button
          onClick={handleZoomIn}
          className="p-1 rounded hover:bg-[var(--theme-sidebar-active-bg)] text-[var(--theme-sidebar-text)]"
          title="Zoom In"
        >
          <ZoomIn size={12} />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1 rounded hover:bg-[var(--theme-sidebar-active-bg)] text-[var(--theme-sidebar-text)]"
          title="Zoom Out"
        >
          <ZoomOut size={12} />
        </button>
        <button
          onClick={handleReset}
          className="p-1 rounded hover:bg-[var(--theme-sidebar-active-bg)] text-[var(--theme-sidebar-text)]"
          title="Reset"
        >
          <RotateCcw size={12} />
        </button>
        <span className="w-px h-3.5 bg-[var(--theme-paper-border)]/20 mx-0.5" />
        <button
          onClick={exportSvg}
          className="p-1 rounded hover:bg-[var(--theme-sidebar-active-bg)] text-[var(--theme-sidebar-text)]"
          title="Download SVG"
        >
          <Download size={12} />
        </button>
      </div>

      {/* Render Canvas */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ cursor: "grab" }}
        className="flex items-center justify-center p-8 min-h-[250px] overflow-hidden select-none touch-none"
      >
        {svgContent ? (
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "center center",
              transition: isDragging.current ? "none" : "transform 0.15s ease-out",
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
            className="max-w-full max-h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-auto"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-xs text-[var(--theme-sidebar-text)]/40 font-mono">
            <span className="w-4 h-4 rounded-full border border-current border-t-transparent animate-spin" />
            <span>Generating diagram...</span>
          </div>
        )}
      </div>
    </div>
  );
}
