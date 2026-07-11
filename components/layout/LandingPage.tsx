"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Type,
  Code2,
  Sparkles,
  LogIn,
  Mail,
  User,
  X,
  Check,
  Zap,
  Database
} from "lucide-react";

export default function LandingPage() {
  // Live Playground State
  const [demoMarkdown, setDemoMarkdown] = useState(
    `# 🌲 The Redwood Journal\n\nWriting is a tactile craft. We believe your digital notebook should feel like a *premium physical journal*.\n\n## Why Inkleaf?\n- **100% Offline-First**: Your text never leaves your device.\n- **Typeset Engine**: Beautiful Editorial margins and drop-caps.\n- **Extensible**: Run local JS scripts & customize themes.\n\nTry editing this text right now to see the typeset output update instantly! 👇`
  );
  
  // Interactive Playground Font State
  const [selectedFont, setSelectedFont] = useState<"serif" | "sans" | "handwriting" | "mono">("serif");

  return (
    <div className="min-h-screen bg-[#FAF9F6] bg-[radial-gradient(#e4e2dd_1.5px,transparent_1.5px)] [background-size:24px_24px] text-[#2D3748] font-sans overflow-x-hidden selection:bg-[#B25E43]/10 selection:text-[#B25E43] relative">
      {/* Light Blur Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle_at_center,rgba(178,94,67,0.04),transparent_60%)] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle_at_center,rgba(212,195,179,0.25),transparent_70%)] pointer-events-none" />

      {/* Header Glass Nav */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-[#FAF9F6]/85 border-b border-black/[0.03]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/brand-logo.png" alt="Inkleaf Logo" className="w-8 h-8 rounded-lg object-contain border border-black/[0.04] p-0.5 bg-white" />
            <span className="font-serif font-bold tracking-tight text-[#2D2A26] text-lg">Inkleaf</span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#B25E43] px-1.5 py-0.5 rounded bg-[#B25E43]/5">Studio</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B]">
            <a href="#features" className="hover:text-[#B25E43] transition-colors">Features</a>
            <a href="#values" className="hover:text-[#B25E43] transition-colors">Core Values</a>
            <a href="#compare" className="hover:text-[#B25E43] transition-colors">Comparison</a>
          </nav>

          <Link href="/sign-in">
            <button
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 text-[#2D2A26] font-semibold text-xs border border-black/[0.06] transition-all cursor-pointer"
            >
              <LogIn size={13} />
              <span>Launch Studio</span>
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-5 flex flex-col items-start text-left animate-fade-in">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B25E43]/5 border border-[#B25E43]/10 text-[#B25E43] text-[10px] font-bold tracking-wider uppercase mb-6">
            <Sparkles size={11} />
            <span>Introducing v1.0 — 100% Offline-First</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-[#2D2A26] leading-[1.08] mb-6">
            The Analog Notebook <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B25E43] to-[#8C7A6B]">
              for Digital Writers.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#718096] leading-relaxed mb-8 max-w-lg">
            Write in clean Markdown, watch it become a beautiful typeset manuscript. Zero-trust local privacy with Google/Stripe-grade typography controls.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            <Link href="/sign-in">
              <button
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#2D2A26] hover:bg-[#1E1C1A] text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                <span>Verify & Launch Studio</span>
                <ArrowRight size={14} />
              </button>
            </Link>
            <a
              href="#playground"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-black/[0.02] text-[#8C7A6B] border border-black/[0.08] font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <span>Try Live Sandbox</span>
            </a>
          </div>

          {/* Luxury Brand Physical Journal Mockup Card */}
          <div className="mt-10 relative w-full max-w-md rounded-2xl overflow-hidden border border-black/[0.06] shadow-[0_15px_45px_rgba(140,122,107,0.06)]">
            <img 
              src="/brand-hero.png" 
              alt="Inkleaf Journal Craftsmanship" 
              className="w-full h-48 object-cover transform hover:scale-[1.03] transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Live Interactive Hero Playground Mockup */}
        <div className="lg:col-span-7 w-full" id="playground">
          <div className="rounded-2xl bg-white border border-black/[0.08] shadow-[0_25px_60px_-15px_rgba(140,122,107,0.12)] p-1.5 relative group overflow-hidden">
            {/* Visual Header Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/[0.04] text-xs text-[#718096]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B25E43]/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#8C7A6B]/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span className="ml-2 font-mono text-[10px] text-[#8C7A6B]">interactive_sandbox.md</span>
              </div>
              
              {/* Live Font Switcher */}
              <div className="flex items-center gap-1 bg-black/[0.02] p-0.5 rounded-md border border-black/[0.04]">
                {(["serif", "sans", "handwriting", "mono"] as const).map(font => (
                  <button
                    key={font}
                    onClick={() => setSelectedFont(font)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize transition-all cursor-pointer ${
                      selectedFont === font
                        ? "bg-[#2D2A26] text-white shadow-sm"
                        : "text-[#8C7A6B] hover:text-black"
                    }`}
                  >
                    {font}
                  </button>
                ))}
              </div>
            </div>

            {/* Split Editor/Typeset Sandbox */}
            <div className="grid grid-cols-1 md:grid-cols-2 min-h-[380px]">
              {/* Markdown Source Area */}
              <div className="p-4 border-r border-black/[0.04] flex flex-col bg-[#FCFBF9]">
                <div className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-wider mb-2">Source Markdown</div>
                <textarea
                  value={demoMarkdown}
                  onChange={(e) => setDemoMarkdown(e.target.value)}
                  className="flex-1 w-full bg-transparent resize-none outline-none font-mono text-xs text-[#2D3748] leading-relaxed border-0 focus:ring-0 p-0"
                />
              </div>

              {/* Styled Typeset Output Area */}
              <div className="p-6 bg-[#FCF8F2] text-[#1E293B] overflow-y-auto flex flex-col justify-start select-none max-h-[380px] relative">
                <div className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider mb-4 pb-1 border-b border-[#D4C3B3]/30">Typeset Sheet</div>
                <div className={`prose prose-sm leading-relaxed text-left ${
                  selectedFont === "serif" ? "font-serif" :
                  selectedFont === "sans" ? "font-sans" :
                  selectedFont === "handwriting" ? "font-handwriting" : "font-mono"
                }`}>
                  {/* Basic Dynamic markdown parser stub for demonstration */}
                  {demoMarkdown.split("\n").map((line, idx) => {
                    if (line.startsWith("# ")) {
                      return <h1 key={idx} className="text-xl font-bold tracking-tight mt-0 mb-3 text-[#1E293B]">{line.substring(2)}</h1>;
                    }
                    if (line.startsWith("## ")) {
                      return <h2 key={idx} className="text-base font-bold mt-4 mb-2 text-[#1E293B]">{line.substring(3)}</h2>;
                    }
                    if (line.startsWith("- ")) {
                      return <li key={idx} className="list-disc pl-2 ml-4 text-xs mb-1 text-[#4A5568]">{line.substring(2)}</li>;
                    }
                    if (line.trim() === "") {
                      return <div key={idx} className="h-2" />;
                    }
                    return <p key={idx} className="text-xs text-[#4A5568] leading-relaxed my-1.5">{line}</p>;
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats Metrics Strip */}
      <section className="border-y border-black/[0.04] bg-white/70 backdrop-blur-md py-12 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-serif font-bold text-[#2D2A26] tracking-tight">0 ms</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B] mt-1">Cloud Latency</div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-[#2D2A26] tracking-tight">100%</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B] mt-1">Privacy Guarantee</div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-[#2D2A26] tracking-tight">24 kb</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B] mt-1">Local Footprint</div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-[#2D2A26] tracking-tight">Sub-ms</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B] mt-1">Credential Cache</div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-28 px-6 bg-[#FAF9F6]/40" id="values">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-xs uppercase tracking-widest font-bold text-[#B25E43] mb-3">Enterprise Core Values</h2>
            <h3 className="text-3xl sm:text-4xl font-serif font-bold text-[#2D2A26] tracking-tight">Why MNC Professionals Trust Inkleaf</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="p-8 rounded-2xl bg-white border border-black/[0.05] shadow-sm text-left hover:border-[#B25E43]/30 transition-all group relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-[#B25E43]/5 flex items-center justify-center text-[#B25E43] mb-6 group-hover:bg-[#B25E43]/10 transition-all">
                <ShieldCheck size={20} />
              </div>
              <h4 className="text-lg font-serif font-bold text-[#2D2A26] mb-3">Zero-Trust Local Execution</h4>
              <p className="text-sm text-[#718096] leading-relaxed">
                Zero data syncs to third-party databases. Content is parsed and stored entirely locally in your sandbox IndexedDB, protecting business secrets.
              </p>
            </div>

            {/* Value 2 */}
            <div className="p-8 rounded-2xl bg-white border border-black/[0.05] shadow-sm text-left hover:border-[#B25E43]/30 transition-all group relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-[#B25E43]/5 flex items-center justify-center text-[#B25E43] mb-6 group-hover:bg-[#B25E43]/10 transition-all">
                <Type size={20} />
              </div>
              <h4 className="text-lg font-serif font-bold text-[#2D2A26] mb-3">Typeset-Grade Output</h4>
              <p className="text-sm text-[#718096] leading-relaxed">
                Enjoy a focused book-style environment. Typeset margins, custom sizing, and elegant fonts (Serif, Sans, Mono, Kalam handwriting) out of the box.
              </p>
            </div>

            {/* Value 3 */}
            <div className="p-8 rounded-2xl bg-white border border-black/[0.05] shadow-sm text-left hover:border-[#B25E43]/30 transition-all group relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-[#B25E43]/5 flex items-center justify-center text-[#B25E43] mb-6 group-hover:bg-[#B25E43]/10 transition-all">
                <Code2 size={20} />
              </div>
              <h4 className="text-lg font-serif font-bold text-[#2D2A26] mb-3">Script & Theme Sandbox</h4>
              <p className="text-sm text-[#718096] leading-relaxed">
                Create personalized writing environments. Customize styling tokens with a real-time palette interface and execute custom javascript extensions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Comparison Matrix */}
      <section className="py-24 px-6 bg-white border-t border-black/[0.03] shadow-sm" id="compare">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest font-bold text-[#B25E43] mb-3">Competitive Specs</h2>
            <h3 className="text-3xl font-serif font-bold text-[#2D2A26] tracking-tight">How Inkleaf Compares</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-black/[0.08] text-xs font-bold uppercase tracking-wider text-[#8C7A6B]">
                  <th className="py-4 px-6">Features</th>
                  <th className="py-4 px-6 text-[#B25E43]">Inkleaf Studio</th>
                  <th className="py-4 px-6">Google Docs</th>
                  <th className="py-4 px-6">Notion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.03] text-[#718096]">
                <tr>
                  <td className="py-4 px-6 font-serif font-semibold text-[#2D2A26]">Data Storage</td>
                  <td className="py-4 px-6 text-[#B25E43] font-semibold flex items-center gap-1.5">
                    <Database size={13} />
                    <span>Local IndexedDB</span>
                  </td>
                  <td className="py-4 px-6">Google Cloud</td>
                  <td className="py-4 px-6">AWS Servers</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-serif font-semibold text-[#2D2A26]">Offline Capability</td>
                  <td className="py-4 px-6 text-[#B25E43] font-semibold flex items-center gap-1.5">
                    <Check size={13} />
                    <span>100% Fully Offline</span>
                  </td>
                  <td className="py-4 px-6">Extension Required</td>
                  <td className="py-4 px-6">Degraded / None</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-serif font-semibold text-[#2D2A26]">Rendering Layout</td>
                  <td className="py-4 px-6 text-[#B25E43] font-semibold flex items-center gap-1.5">
                    <Zap size={13} />
                    <span>Typeset Manuscript</span>
                  </td>
                  <td className="py-4 px-6">Basic Rich Text</td>
                  <td className="py-4 px-6">Block Elements</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-serif font-semibold text-[#2D2A26]">Themes & Customizer</td>
                  <td className="py-4 px-6 text-[#B25E43] font-semibold flex items-center gap-1.5">
                    <Check size={13} />
                    <span>Color Studio Panel</span>
                  </td>
                  <td className="py-4 px-6">Light Only</td>
                  <td className="py-4 px-6">Standard Presets</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Support Us Section */}
      <section className="py-20 px-6 bg-[#FAF9F6] border-t border-black/[0.03]">
        <div className="max-w-4xl mx-auto text-center rounded-2xl bg-[#FCFBF9] border border-black/[0.04] p-10 md:p-14 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[radial-gradient(circle_at_center,rgba(178,94,67,0.03),transparent_60%)] pointer-events-none" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B25E43]/5 text-[#B25E43] text-[10px] font-bold tracking-wider uppercase mb-6">
            <Sparkles size={11} />
            <span>Support Independent Craftsmanship</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#2D2A26] mb-4">
            Love writing with Inkleaf?
          </h3>
          <p className="text-sm text-[#718096] leading-relaxed max-w-lg mx-auto mb-8">
            Inkleaf Studio is 100% client-side, offline-first, and completely free of third-party ads or surveillance. Support our dedication to beautiful typography.
          </p>
          <a
            href="https://buymeachai.in/bittuofficial44"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#B25E43] hover:bg-[#A14D33] text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <span>☕ Buy Me a Chai</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="py-16 border-t border-black/[0.04] text-xs text-[#8C7A6B] text-center max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>© 2026 Inkleaf Studio. All rights reserved. 100% client-side compilation.</div>
        <div className="flex items-center gap-6">
          <span className="hover:text-[#B25E43] transition-colors cursor-pointer">Security Ledger</span>
          <span className="hover:text-[#B25E43] transition-colors cursor-pointer">Telemetry Exclusions</span>
          <span className="hover:text-[#B25E43] transition-colors cursor-pointer">GitHub Mirror</span>
        </div>
      </footer>

    </div>
  );
}
