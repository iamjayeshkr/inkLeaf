# Inkleaf Studio

A modern, distraction-free writing studio and cloud sync ledger designed for writers. Inkleaf features a high-fidelity split-pane workspace with a dark, syntax-highlighted markdown editor on the left, and a warm, serif, typeset manuscript preview on the right.

---

## 🎨 Visual Philosophy
Inkleaf is designed with a premium, minimal, paper-like aesthetic:
- **Editor Pane**: Deep charcoal colors, monospaced typography, and subtle syntax highlighting.
- **Preview Pane**: Warm paper background textures, elegant serif typography, clean blockquotes, and gold accents.
- **Grid Canvas**: Responsive layout with a subtle, non-intrusive backdrop dot matrix.

---

## ✨ Features

- **Live Split Workspace**: Write Markdown on the left and see it instantly rendered as a publication-ready manuscript on the right. Toggle between Edit, Split, and Read-Only modes.
- **GitHub-Flavored Markdown**: Full support for task lists, strikethrough, autolinks, custom tables, and copyable syntax-highlighted code blocks.
- **Mathematical Typesetting**: Fully integrated KaTeX support for rendering inline math (`$inline$`) and block math (`$$block$$`).
- **Secure Unified Authentication**: Centralized Clerk authentication integration. New user registrations (including Google OAuth and Email OTP) are managed via a single reusable `AuthWrapper` component.
- **Flexible Document Tools**: Export manuscripts in markdown, HTML, DOCX, PDF, PNG, or export your entire local workspace database as a JSON backup.
- **Version History & Metrics**: Built-in status bar tracking live word count, reading time estimates, character counts, and a version history ledger.
- **Distraction-Free Modes**: Fullscreen presentation overlays and reading-only views.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Custom CSS variables
- **State Management**: Zustand
- **Authentication**: Clerk Core 3 (Signals edition)
- **Markdown Processing**: `react-markdown`, `remark-gfm`, `remark-math`, `rehype-katex`, `rehype-slug`
- **Database**: Local IndexedDB wrapper

---

## 📂 Project Structure

```bash
markdown-studio/
├── app/                  # Next.js App Router entrypoints
│   ├── layout.tsx        # Root layout, Google Fonts (Inter, Source Serif, Mono, Kalam) & Clerk Provider
│   ├── page.tsx          # Main Workspace dashboard (Editor, Preview, Toolbars)
│   ├── sign-in/          # Clerk prebuilt Sign-In catch-all route
│   └── sign-up/          # Clerk prebuilt Sign-Up catch-all route
├── components/           # Reusable UI layout elements
│   ├── auth/
│   │   └── AuthWrapper.tsx  # Centralized authentication wrapper
│   └── layout/           # Sidebars, TopNav, StatusBar, and Landing layouts
├── features/             # Feature-specific components and logic
│   ├── editor/           # Markdown editor and toolbar
│   ├── preview/          # Typeset previewer and presentation modes
│   └── history/          # Version history log drawer
├── lib/                  # Helper utilities, exporters, and database wrappers
└── stores/               # Zustand global state engines (theme, settings, files)
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have **Node.js (v18+)** and **npm** installed on your system.

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

### 3. Installation
Install the project dependencies:
```bash
npm install
```

### 4. Running locally
Launch the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 5. Building for Production
Verify that the codebase compiles cleanly and optimize it for production:
```bash
npm run build
npm start
```
