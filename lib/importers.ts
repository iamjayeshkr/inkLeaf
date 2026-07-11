import { FileNode } from "../types";

export interface ImportedNode {
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: ImportedNode[];
}

/**
 * Client-side file importers
 */
export class FileImporter {
  
  // Read text files (.md, .txt, .html, .json)
  public static readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  // Parse HTML into simple markdown blocks
  public static htmlToMarkdown(htmlString: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    const body = doc.body;

    let markdown = "";

    const cleanText = (text: string) => text.replace(/\s+/g, " ").trim();

    const traverse = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        markdown += node.textContent;
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return;

      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();

      switch (tagName) {
        case "h1":
          markdown += "\n# ";
          break;
        case "h2":
          markdown += "\n## ";
          break;
        case "h3":
          markdown += "\n### ";
          break;
        case "p":
          markdown += "\n\n";
          break;
        case "br":
          markdown += "\n";
          break;
        case "strong":
        case "b":
          markdown += "**";
          break;
        case "em":
        case "i":
          markdown += "*";
          break;
        case "code":
          markdown += "`";
          break;
        case "pre":
          markdown += "\n```\n";
          break;
        case "blockquote":
          markdown += "\n> ";
          break;
        case "li":
          markdown += "\n- ";
          break;
        case "a":
          markdown += "[";
          break;
      }

      // Process children
      element.childNodes.forEach(traverse);

      switch (tagName) {
        case "strong":
        case "b":
          markdown += "**";
          break;
        case "em":
        case "i":
          markdown += "*";
          break;
        case "code":
          markdown += "`";
          break;
        case "pre":
          markdown += "\n```\n";
          break;
        case "a":
          const href = element.getAttribute("href") || "#";
          markdown += `](${href})`;
          break;
        case "p":
          markdown += "\n";
          break;
      }
    };

    body.childNodes.forEach(traverse);
    return markdown.replace(/\n{3,}/g, "\n\n").trim();
  }

  // Parse JSON workspace restore
  public static parseWorkspaceJson(jsonString: string): FileNode[] {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        // Validate keys
        const isValid = parsed.every(
          item =>
            typeof item.id === "string" &&
            typeof item.name === "string" &&
            (item.type === "file" || item.type === "folder")
        );
        if (isValid) return parsed as FileNode[];
      }
      throw new Error("Workspace JSON must be a valid FileNode array");
    } catch (e) {
      console.error(e);
      throw new Error("Invalid Workspace file backup");
    }
  }
}
