"use client";

import React, { useState } from "react";
import { useFileStore } from "../../stores/useFileStore";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { FileNode } from "../../types";
import { cn } from "../../lib/utils";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Folder,
  FolderOpen,
  FileText,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  Star,
  Pin,
  Search,
  MoreVertical,
  ChevronLeft,
  Settings,
  FolderPlus,
  FilePlus,
  Compass,
  Palette,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

interface SidebarProps {
  onOpenThemeEditor?: () => void;
  onOpenAbout?: () => void;
}

export default function Sidebar({ onOpenThemeEditor, onOpenAbout }: SidebarProps) {
  const {
    files,
    activeFileId,
    openTab,
    createFile,
    createFolder,
    deleteNode,
    renameNode,
    toggleFavorite,
    togglePin,
    moveNode,
    recentFiles,
  } = useFileStore();

  const { toggleSidebar, themeMode, setThemeMode, updateSearchState } = useSettingsStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "folder-welcome": true, // Default open welcome folder
  });
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStartRename = (node: FileNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNodeId(node.id);
    setEditingName(node.name);
  };

  const handleFinishRename = async (id: string) => {
    if (editingName.trim()) {
      await renameNode(id, editingName.trim());
    }
    setEditingNodeId(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      handleFinishRename(id);
    } else if (e.key === "Escape") {
      setEditingNodeId(null);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    if (!draggedId || draggedId === targetFolderId) return;

    // Avoid dropping folder inside its own children
    const isDescendant = (parent: string, child: string): boolean => {
      const childNode = files.find(f => f.id === child);
      if (!childNode || !childNode.parentId) return false;
      if (childNode.parentId === parent) return true;
      return isDescendant(parent, childNode.parentId);
    };

    if (files.some(f => f.id === draggedId && f.type === "folder") && targetFolderId) {
      if (isDescendant(draggedId, targetFolderId)) {
        return; // Cyclic move prevented
      }
    }

    await moveNode(draggedId, targetFolderId);
  };

  // Node renderer
  const renderTreeNode = (node: FileNode, depth = 0) => {
    const isFolder = node.type === "folder";
    const isExpanded = expandedFolders[node.id];
    const isEditing = editingNodeId === node.id;
    const isActive = activeFileId === node.id;

    const children = files.filter(f => f.parentId === node.id);

    return (
      <div
        key={node.id}
        draggable={!isEditing}
        onDragStart={e => handleDragStart(e, node.id)}
        onDragOver={handleDragOver}
        onDrop={e => handleDrop(e, isFolder ? node.id : node.parentId)}
        className="select-none"
      >
        <div
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest("button")) return;

            if (isFolder) {
              toggleFolder(node.id);
            } else {
              openTab(node.id);
            }
          }}
          className={cn(
            "group flex items-center gap-1.5 py-1 pr-2 rounded-md cursor-pointer text-xs transition-colors relative",
            isActive
              ? "bg-[var(--theme-sidebar-active-bg)] text-[var(--theme-sidebar-active-text)] font-medium"
              : "hover:bg-[var(--theme-sidebar-active-bg)]/40 text-[var(--theme-sidebar-text)]"
          )}
        >
          {/* Collapse/Expand indicator for folders */}
          {isFolder ? (
            <span className="text-[var(--theme-sidebar-text)]/60">
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          ) : (
            <span className="w-3.5 flex-none" />
          )}

          {/* Icon */}
          <span className="flex-none text-[var(--theme-accent)]">
            {isFolder ? (
              isExpanded ? <FolderOpen size={14} /> : <Folder size={14} />
            ) : (
              <FileText size={14} />
            )}
          </span>

          {/* Label */}
          {isEditing ? (
            <input
              type="text"
              value={editingName}
              onChange={e => setEditingName(e.target.value)}
              onBlur={() => handleFinishRename(node.id)}
              onKeyDown={e => handleKeyPress(e, node.id)}
              onClick={e => e.stopPropagation()}
              className="flex-1 bg-[var(--theme-editor-bg)] text-[var(--theme-editor-text)] px-1 rounded border border-[var(--theme-accent)] outline-none min-w-0 font-mono py-0.5"
              autoFocus
            />
          ) : (
            <span className="flex-1 truncate py-0.5">{node.name}</span>
          )}

          {/* Action options */}
          {!isEditing && (
            <div className="absolute right-1 flex opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 has-[button[data-state=open]]:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto has-[button[data-state=open]]:pointer-events-auto transition-opacity duration-150 items-center gap-0.5 bg-inherit pl-2 shadow-sm rounded-md py-0.5 pr-0.5">
              {isFolder ? (
                <>
                  <button
                    onClick={async e => {
                      e.stopPropagation();
                      toggleFolder(node.id);
                      if (!isExpanded) toggleFolder(node.id);
                      await createFile("Untitled note", node.id);
                    }}
                    title="Add file inside"
                    className="p-1 rounded hover:bg-[var(--theme-sidebar-active-bg)] text-[var(--theme-sidebar-text)]/80 hover:text-[var(--theme-accent)]"
                  >
                    <FilePlus size={12} />
                  </button>
                  <button
                    onClick={async e => {
                      e.stopPropagation();
                      toggleFolder(node.id);
                      await createFolder("New folder", node.id);
                    }}
                    title="Add folder inside"
                    className="p-1 rounded hover:bg-[var(--theme-sidebar-active-bg)] text-[var(--theme-sidebar-text)]/80 hover:text-[var(--theme-accent)]"
                  >
                    <FolderPlus size={12} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={async e => {
                      e.stopPropagation();
                      await toggleFavorite(node.id);
                    }}
                    title={node.isFavorite ? "Unfavorite" : "Favorite"}
                    className={cn(
                      "p-1 rounded hover:bg-[var(--theme-sidebar-active-bg)]",
                      node.isFavorite
                        ? "text-yellow-500"
                        : "text-[var(--theme-sidebar-text)]/80 hover:text-yellow-500"
                    )}
                  >
                    <Star size={12} fill={node.isFavorite ? "currentColor" : "none"} />
                  </button>
                  <button
                    onClick={async e => {
                      e.stopPropagation();
                      await togglePin(node.id);
                    }}
                    title={node.isPinned ? "Unpin" : "Pin note"}
                    className={cn(
                      "p-1 rounded hover:bg-[var(--theme-sidebar-active-bg)]",
                      node.isPinned
                        ? "text-[var(--theme-accent)]"
                        : "text-[var(--theme-sidebar-text)]/80 hover:text-[var(--theme-accent)]"
                    )}
                  >
                    <Pin size={12} />
                  </button>
                </>
              )}

              {/* Context Dropdown Trigger */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    className="p-1 rounded hover:bg-[var(--theme-sidebar-active-bg)] text-[var(--theme-sidebar-text)]/80"
                  >
                    <MoreVertical size={12} />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    onClick={e => e.stopPropagation()}
                    className="z-50 min-w-[120px] rounded-lg border border-[var(--theme-paper-border)] bg-[var(--theme-editor-bg)] text-[var(--theme-editor-text)] p-1 shadow-lg animate-in fade-in zoom-in duration-100"
                    sideOffset={5}
                  >
                    <DropdownMenu.Item
                      onSelect={e => handleStartRename(node, e as any)}
                      className="flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-[var(--theme-accent)] hover:text-white cursor-pointer outline-none"
                    >
                      <Edit2 size={12} /> Rename
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={() => deleteNode(node.id)}
                      className="flex items-center gap-2 px-2 py-1.5 text-xs rounded text-red-500 hover:bg-red-500 hover:text-white cursor-pointer outline-none font-medium"
                    >
                      <Trash2 size={12} /> Delete
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          )}
        </div>

        {/* Render nested children */}
        {isFolder && isExpanded && (
          <div className="mt-0.5 border-l border-[var(--theme-paper-border)]/20 ml-2.5">
            {children.length > 0 ? (
              children.map(child => renderTreeNode(child, depth + 1))
            ) : (
              <div
                style={{ paddingLeft: `${(depth + 1) * 12 + 18}px` }}
                className="py-1 text-[10px] text-[var(--theme-sidebar-text)]/40 italic"
              >
                Empty Folder
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Favorites, pins, and recents queries
  const favoriteFiles = files.filter(f => f.type === "file" && f.isFavorite);
  const pinnedFiles = files.filter(f => f.type === "file" && f.isPinned);
  const recentNodes = files.filter(
    f => f.type === "file" && recentFiles.includes(f.id)
  );

  // Global file filter for search box
  const filteredRootNodes = files.filter(
    f =>
      f.parentId === null &&
      (searchQuery
        ? f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (f.type === "file" && f.content?.toLowerCase().includes(searchQuery.toLowerCase()))
        : true)
  );

  return (
    <div className="flex flex-col h-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <img src="/brand-logo.png" alt="Inkleaf Logo" className="w-5 h-5 object-contain rounded bg-white p-0.5 border border-black/[0.04]" />
          <span className="font-serif text-[14px] font-semibold tracking-tight text-[var(--theme-sidebar-active-text)]">
            Inkleaf Studio
          </span>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded text-[var(--theme-sidebar-text)]/60 hover:text-[var(--theme-accent)] hover:bg-[var(--theme-sidebar-active-bg)]/40 transition-colors"
          title="Collapse sidebar"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Global Actions */}
      <div className="flex gap-1.5 px-3 pt-3">
        <button
          onClick={() => createFile("Untitled.md", null)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[var(--theme-accent)] text-white hover:bg-[var(--theme-accent-soft)]/90 rounded-md text-[11px] font-medium shadow-sm transition-colors cursor-pointer"
        >
          <FilePlus size={13} /> New Note
        </button>
        <button
          onClick={() => createFolder("New Folder", null)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[var(--theme-sidebar-active-bg)]/45 hover:bg-[var(--theme-sidebar-active-bg)]/70 text-[var(--theme-sidebar-active-text)] rounded-md text-[11px] font-medium transition-colors cursor-pointer"
        >
          <FolderPlus size={13} /> Folder
        </button>
      </div>

      {/* Search Input */}
      <div className="px-3 pt-2 pb-1.5">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[var(--theme-editor-bg)]/40 text-[var(--theme-sidebar-text)] text-xs">
          <Search size={13} className="text-[var(--theme-sidebar-text)]/40" />
          <input
            type="text"
            placeholder="Quick search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-[var(--theme-sidebar-active-text)] placeholder:text-[var(--theme-sidebar-text)]/40 min-w-0"
          />
        </div>
      </div>

      {/* Scroller Container */}
      <div
        className="flex-1 overflow-y-auto px-2 space-y-3.5 py-2"
        onDragOver={handleDragOver}
        onDrop={e => handleDrop(e, null)}
      >
        {/* Quick sections when search is inactive */}
        {!searchQuery && (
          <>
            {/* Pinned section */}
            {pinnedFiles.length > 0 && (
              <div>
                <div className="flex items-center gap-1 px-1.5 text-[9px] uppercase tracking-wider text-[var(--theme-sidebar-text)]/40 font-semibold mb-1">
                  <Pin size={9} /> Pinned
                </div>
                <div className="space-y-0.5">
                  {pinnedFiles.map(f => (
                    <div
                      key={f.id}
                      onClick={() => openTab(f.id)}
                      className={cn(
                        "flex items-center gap-2 py-1 px-2 rounded-md cursor-pointer text-xs transition-colors",
                        activeFileId === f.id
                          ? "bg-[var(--theme-sidebar-active-bg)] text-[var(--theme-sidebar-active-text)] font-medium"
                          : "hover:bg-[var(--theme-sidebar-active-bg)]/40 text-[var(--theme-sidebar-text)]"
                      )}
                    >
                      <FileText size={13} className="text-[var(--theme-accent)]" />
                      <span className="truncate flex-1">{f.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Favorites section */}
            {favoriteFiles.length > 0 && (
              <div>
                <div className="flex items-center gap-1 px-1.5 text-[9px] uppercase tracking-wider text-[var(--theme-sidebar-text)]/40 font-semibold mb-1">
                  <Star size={9} /> Favorites
                </div>
                <div className="space-y-0.5">
                  {favoriteFiles.map(f => (
                    <div
                      key={f.id}
                      onClick={() => openTab(f.id)}
                      className={cn(
                        "flex items-center gap-2 py-1 px-2 rounded-md cursor-pointer text-xs transition-colors",
                        activeFileId === f.id
                          ? "bg-[var(--theme-sidebar-active-bg)] text-[var(--theme-sidebar-active-text)] font-medium"
                          : "hover:bg-[var(--theme-sidebar-active-bg)]/40 text-[var(--theme-sidebar-text)]"
                      )}
                    >
                      <Star size={13} className="text-yellow-500" fill="currentColor" />
                      <span className="truncate flex-1">{f.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Directory Explorer Tree */}
        <div>
          <div className="flex items-center justify-between px-1.5 text-[9px] uppercase tracking-wider text-[var(--theme-sidebar-text)]/40 font-semibold mb-1">
            <span className="flex items-center gap-1">
              <Compass size={9} /> Explorer
            </span>
          </div>

          <div className="space-y-0.5">
            {filteredRootNodes.length > 0 ? (
              filteredRootNodes.map(node => renderTreeNode(node, 0))
            ) : (
              <div className="px-2 py-3 text-center text-xs text-[var(--theme-sidebar-text)]/40 italic">
                {searchQuery ? "No search results" : "No files yet"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Support Promo Banner in Sidebar */}
      <div className="mx-3 my-1.5 p-2 rounded-xl bg-[var(--theme-sidebar-active-bg)]/30 flex flex-col gap-1 border border-black/[0.03]">
        <div className="text-[9px] font-bold text-[var(--theme-sidebar-text)]/40 uppercase tracking-widest">Support Craftsmanship</div>
        <a
          href="https://buymeachai.in/bittuofficial44"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between text-xs font-semibold text-[var(--theme-sidebar-active-text)] hover:text-[var(--theme-accent)] transition-colors"
        >
          <span>☕ Buy Me a Chai</span>
          <ChevronRight size={12} className="opacity-60" />
        </a>
      </div>

      {/* Settings / Footer info */}
      <div className="p-3 bg-[var(--theme-sidebar-bg)] flex items-center justify-between">
        <button
          onClick={onOpenThemeEditor}
          className="flex items-center gap-1.5 p-1 rounded-md text-[var(--theme-sidebar-text)]/70 hover:text-[var(--theme-accent)] hover:bg-[var(--theme-sidebar-active-bg)]/40 text-xs transition-colors cursor-pointer"
        >
          <Palette size={13} className="text-[var(--theme-accent)]" />
          <span>Theme</span>
        </button>

        <div className="flex items-center gap-2">
          {onOpenAbout && (
            <button
              onClick={onOpenAbout}
              className="p-1 rounded-md text-[var(--theme-sidebar-text)]/70 hover:text-[var(--theme-accent)] hover:bg-[var(--theme-sidebar-active-bg)]/40 transition-colors cursor-pointer"
              title="About Inkleaf Studio"
            >
              <HelpCircle size={13} />
            </button>
          )}
          <div className="flex items-center scale-90 select-none">
            <UserButton />
          </div>
          <span className="text-[10px] font-mono text-[var(--theme-sidebar-text)]/30 font-medium select-none">
            v1.0.0
          </span>
        </div>
      </div>
    </div>
  );
}
