"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Heart } from "lucide-react";

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutDialog({ isOpen, onClose }: AboutDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        {/* Backdrop Overlay */}
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />

        {/* Dialog Content Container */}
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 transform rounded-3xl border-2 border-[#D4C3B3] bg-[#FCF8F2] text-[#1E293B] p-6 md:p-8 shadow-2xl overflow-y-auto select-none focus:outline-none font-sans animate-in fade-in zoom-in-95 duration-200">
          
          {/* Notebook Spiral Ring Binder Doodles at the top */}
          <div className="absolute top-0 left-0 right-0 flex justify-center gap-5 md:gap-6 -mt-3.5 z-10 pointer-events-none select-none">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <div 
                key={n} 
                className="w-3 h-7 rounded-full bg-gradient-to-b from-gray-400 via-gray-200 to-gray-500 border border-gray-600/30 shadow-sm shrink-0" 
              />
            ))}
          </div>

          <div className="flex justify-end -mt-2 -mr-2 mb-2">
            <Dialog.Close asChild>
              <button className="p-1.5 rounded-full hover:bg-[#EFE9DC] text-gray-500 hover:text-gray-800 transition-colors cursor-pointer border border-[#E3D6C5]">
                <X size={14} />
              </button>
            </Dialog.Close>
          </div>

          {/* Master 2-column Container */}
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            
            {/* Left Column: Polaroid photo */}
            <div className="w-full md:w-auto flex flex-col items-center shrink-0">
              <div className="bg-white p-3 pb-6 shadow-xl border border-gray-200/60 rounded-xs transform -rotate-3 hover:rotate-0 transition-transform duration-300 w-48 shrink-0">
                <div className="aspect-[3/4] relative overflow-hidden bg-gray-50 border border-gray-100 rounded-sm">
                  <img 
                    src="/creator.png" 
                    className="w-full h-full object-cover" 
                    alt="Jayesh Sharma"
                  />
                </div>
                <div className="text-center font-handwriting text-2xl text-[#1A2F5A] mt-3 font-bold leading-none">
                  Jayesh Sharma
                </div>
                <div className="text-center font-handwriting text-sm text-gray-500 mt-1.5 leading-none">
                  Creator & Craftsman
                </div>
              </div>
              
              {/* Retro Stamp Sticker */}
              <div className="mt-6 border-2 border-dashed border-[#D48C8C] rounded-lg p-2.5 text-center transform rotate-6 max-w-[170px] hidden md:block">
                <div className="text-[9px] uppercase tracking-wider font-bold text-[#C57474] font-mono">
                  Inkleaf Studio
                </div>
                <div className="font-handwriting text-lg text-[#C57474] font-bold leading-tight mt-0.5">
                  100% Offline Sync
                </div>
              </div>
            </div>

            {/* Right Column: Handwritten letter & Features */}
            <div className="flex-1 space-y-4">
              
              {/* Heading */}
              <div>
                <span className="font-mono text-[9px] font-bold text-[#9D8B75] uppercase tracking-widest">
                  Behind Inkleaf Studio
                </span>
                <Dialog.Title asChild>
                  <h2 className="font-handwriting text-4xl font-bold text-[#1A2F5A] mt-0.5 leading-tight">
                    A personal note from the creator
                  </h2>
                </Dialog.Title>
                <Dialog.Description asChild>
                  <span className="sr-only">A personal handwritten letter from Jayesh Sharma about Inkleaf Studio.</span>
                </Dialog.Description>
              </div>

              {/* Personal Letter in Cursive */}
              <div className="font-handwriting text-xl text-[#1C2E5C] leading-relaxed space-y-3.5">
                <p>
                  Hey there, fellow writer!
                </p>
                <p>
                  I built Inkleaf Studio because I was tired of modern document editors. They are either cluttered with online sync popups, or they leak your thoughts to cloud servers. I wanted a space that felt like a <span className="underline decoration-[#C8B6A4] decoration-wavy">physical notebook</span>—tactile, clean, completely offline, and beautiful.
                </p>
                <p>
                  Inkleaf runs 100% locally in your browser wrapper. Every word you type is stored in local database boxes. When you customize themes, you're designing your own digital desk.
                </p>
                <p>
                  Thank you for being part of this crafting journey. Let's make writing analog again!
                </p>
                
                {/* Signature */}
                <div className="pt-2 text-right">
                  <div className="inline-block text-left">
                    <p className="text-gray-400 text-[10px] font-sans">Warmly,</p>
                    <p className="text-3xl font-bold text-[#BC4749] mt-0.5 transform -rotate-1">Jayesh Sharma</p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-[#E3D6C5] my-4" />

              {/* Handwritten style feature checklist */}
              <div className="space-y-2.5">
                <h3 className="font-handwriting text-2xl font-bold text-[#1A2F5A] underline decoration-wavy decoration-[#C8B6A4]">
                  Key Principles of the Studio:
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex items-start gap-2">
                    <span className="text-[#BC4749] text-base font-bold font-mono">✓</span>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">100% Local Privacy</h4>
                      <p className="text-[11px] text-gray-600 leading-normal mt-0.5">
                        Zero trackers, zero databases online. Your manuscripts live exclusively on your system.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="text-[#BC4749] text-base font-bold font-mono">✓</span>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">Custom Typography</h4>
                      <p className="text-[11px] text-gray-600 leading-normal mt-0.5">
                        Whether it is Apple SF Pro, Google Sans, or Notebook script, style your workspace.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="text-[#BC4749] text-base font-bold font-mono">✓</span>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">Direct Copilots</h4>
                      <p className="text-[11px] text-gray-600 leading-normal mt-0.5">
                        Plug in your personal API keys for Gemini or Ollama. No wrapper fees or middleware proxy.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="text-[#BC4749] text-base font-bold font-mono">✓</span>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">Typeset & Slides</h4>
                      <p className="text-[11px] text-gray-600 leading-normal mt-0.5">
                        Compose markdown files, typeset them to professional PDFs, or present them as slides.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          <div className="h-px bg-[#E3D6C5] mt-6 mb-4" />

          {/* Footer Love */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-gray-500 gap-4">
            <div className="flex items-center gap-1.5">
              <span>Made with deep care</span>
              <Heart size={10} className="text-red-500 fill-red-500 animate-pulse" />
              <span>by Jayesh Sharma — Inkleaf v1.0.0</span>
            </div>
            <a
              href="https://buymeachai.in/bittuofficial44"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#B25E43] text-white font-sans font-bold hover:bg-[#A14D33] transition-colors shadow-xs cursor-pointer"
            >
              <span>☕ Support with Chai</span>
            </a>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
