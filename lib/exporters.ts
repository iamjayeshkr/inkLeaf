import { FileNode } from "../types";

/**
 * Client-side file exporters
 */
export class FileExporter {
  
  // Generic helper to trigger a download in the browser
  private static downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Simple parser to turn basic markdown constructs into HTML tags for rich exports
  private static parseMarkdownToHtml(md: string): string {
    let html = md
      // Clean HTML tags
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Headings
    html = html.replace(/^# (.*?)$/gim, "<h1>$1</h1>");
    html = html.replace(/^## (.*?)$/gim, "<h2>$1</h2>");
    html = html.replace(/^### (.*?)$/gim, "<h3>$1</h3>");
    html = html.replace(/^#### (.*?)$/gim, "<h4>$1</h4>");

    // Bold / Italics / Strikethrough
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    html = html.replace(/~~(.*?)~~/g, "<del>$1</del>");
    html = html.replace(/==(.*?)==/g, "<mark>$1</mark>");

    // Code blocks & Inline code
    html = html.replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>");
    html = html.replace(/`(.*?)`/g, "<code>$1</code>");

    // Blockquotes
    html = html.replace(/^\>\s?(.*?)$/gim, "<blockquote>$1</blockquote>");

    // Unordered lists (simple replacement)
    html = html.replace(/^\-\s?(.*?)$/gim, "<li>$1</li>");

    // Line breaks
    html = html.replace(/\r?\n/g, "<br>");

    return html;
  }

  // 1. Export as raw Markdown (.md)
  public static exportMarkdown(name: string, content: string) {
    const filename = name.endsWith(".md") ? name : `${name}.md`;
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    this.downloadBlob(blob, filename);
  }

  // 2. Export as styled self-contained HTML (.html)
  public static exportHtml(name: string, contentMarkdown: string) {
    const filename = name.endsWith(".html") ? name : `${name}.html`;
    const contentHtml = this.parseMarkdownToHtml(contentMarkdown);

    const htmlWrapper = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body {
      background-color: #fbf8f1;
      color: #1a1a1a;
      font-family: 'Source Serif 4', Georgia, serif;
      line-height: 1.8;
      padding: 3rem 1.5rem;
      max-width: 720px;
      margin: 0 auto;
    }
    h1, h2, h3, h4 {
      color: #14120c;
      font-weight: 700;
      margin-top: 2rem;
      margin-bottom: 1rem;
    }
    h1 { font-size: 2.3rem; border-bottom: 2px solid #c9a227; padding-bottom: 0.5rem; }
    h2 { font-size: 1.6rem; border-bottom: 1px solid #e6dfcc; padding-bottom: 0.25rem; }
    h3 { font-size: 1.3rem; }
    p { margin: 1.1rem 0; font-size: 1.06rem; }
    a { color: #3d5afe; text-decoration: underline; }
    pre { background: #11151e; color: #e4e6ea; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; font-family: 'JetBrains Mono', monospace; font-size: 0.9em; }
    code { background: #f3eee2; color: #7a3e12; padding: 0.15rem 0.3rem; border-radius: 0.25rem; font-family: 'JetBrains Mono', monospace; font-size: 0.9em; }
    pre code { background: transparent; color: inherit; padding: 0; }
    blockquote { border-left: 3px solid #c9a227; padding-left: 1rem; margin: 1.5rem 0; color: #4a4536; font-style: italic; }
    table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-family: 'Inter', sans-serif; font-size: 0.95em; }
    th, td { padding: 0.5rem 0.75rem; border: 1px solid #e6dfcc; }
    th { background: #f3eee2; text-align: left; }
    tr:nth-child(even) td { background: rgba(243, 238, 226, 0.4); }
  </style>
</head>
<body>
  <article>
    ${contentHtml}
  </article>
</body>
</html>`;

    const blob = new Blob([htmlWrapper], { type: "text/html;charset=utf-8" });
    this.downloadBlob(blob, filename);
  }

  // 3. Export to Word Document (.docx / Office HTML format)
  public static exportDocx(name: string, contentMarkdown: string) {
    const filename = name.endsWith(".docx") ? name : `${name}.docx`;
    const contentHtml = this.parseMarkdownToHtml(contentMarkdown);

    const docxTemplate = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <title>${name}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.5;
    }
    h1 { font-size: 24pt; font-weight: bold; border-bottom: 2px solid #C9A227; margin-bottom: 12pt; }
    h2 { font-size: 18pt; font-weight: bold; border-bottom: 1px solid #E6DFCC; margin-bottom: 8pt; }
    h3 { font-size: 14pt; font-weight: bold; }
    p { margin-bottom: 10pt; }
    blockquote { border-left: 3px solid #C9A227; padding-left: 10pt; margin: 12pt 0; font-style: italic; }
    table { width: 100%; border-collapse: collapse; margin: 12pt 0; }
    th, td { border: 1px solid #E6DFCC; padding: 6pt; text-align: left; }
    th { background-color: #F3EEE2; }
  </style>
</head>
<body>
  ${contentHtml}
</body>
</html>`;

    const blob = new Blob([docxTemplate], { type: "application/msword;charset=utf-8" });
    this.downloadBlob(blob, filename);
  }

  // 4. Export as JSON backup (.json)
  public static exportJson(name: string, filesData: FileNode[]) {
    const filename = name.endsWith(".json") ? name : `${name}.json`;
    const jsonString = JSON.stringify(filesData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
    this.downloadBlob(blob, filename);
  }

  // 5. Trigger browser PDF print layout
  public static exportPdf() {
    window.print();
  }

  // 6. Export as PNG image via SVG foreignObject canvas rendering
  public static async exportPng(name: string) {
    const filename = name.endsWith(".png") ? name : `${name}.png`;
    
    // Find the manuscript element
    const element = document.querySelector(".manuscript") as HTMLElement;
    if (!element) {
      alert("Error: Active preview panel not found.");
      return;
    }

    try {
      // Get dimensions of the manuscript content
      const width = element.offsetWidth || 800;
      const height = element.offsetHeight || 1000;

      // Extract stylesheets from the document to preserve custom fonts/themes
      let styles = "";
      for (let i = 0; i < document.styleSheets.length; i++) {
        try {
          const sheet = document.styleSheets[i];
          const rules = sheet.cssRules || sheet.rules;
          for (let r = 0; r < rules.length; r++) {
            styles += rules[r].cssText + "\n";
          }
        } catch (e) {
          // Ignore cross-origin stylesheet reading security errors
        }
      }

      // Clone HTML and inline stylesheet styles
      const htmlContent = element.outerHTML;

      // Wrap in SVG foreignObject structure
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
          <foreignObject width="100%" height="100%">
            <style>
              ${styles}
              body { margin: 0; padding: 0; background: transparent; }
            </style>
            <div xmlns="http://www.w3.org/1999/xhtml" style="background: var(--theme-paper-bg); color: var(--theme-paper-text); padding: 2rem;">
              ${htmlContent}
            </div>
          </foreignObject>
        </svg>
      `;

      // Convert SVG to data URI
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      // Create image element to load the SVG
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;

      img.onload = () => {
        // Create canvas to draw the image
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          alert("Failed to initialize canvas context.");
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0);

        // Convert canvas content to PNG blob
        canvas.toBlob((blob) => {
          if (blob) {
            FileExporter.downloadBlob(blob, filename);
          } else {
            alert("Failed to export canvas as PNG.");
          }
          URL.revokeObjectURL(url);
        }, "image/png");
      };

      img.onerror = (e) => {
        console.error("SVG rendering error:", e);
        alert("Failed to render manuscript elements to canvas.");
        URL.revokeObjectURL(url);
      };
    } catch (err: any) {
      alert("PNG Export failed: " + (err.message || err));
    }
  }
}
