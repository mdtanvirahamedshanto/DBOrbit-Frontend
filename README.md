# DBOrbit Frontend

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-38bdf8?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
</p>

A production-grade web database GUI built with Next.js — designed as a DBeaver/TablePlus-style admin panel for **MongoDB**, **PostgreSQL**, and **MySQL**. Supports full CRUD operations, visual query builder, aggregation pipelines, schema intelligence, and index management — all from a single, responsive workspace.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔌 **Connection Manager** | Add, save, and switch between MongoDB, PostgreSQL, and MySQL connections. Credentials stored safely: metadata in `localStorage`, live URI in `sessionStorage`. |
| 🌳 **Explorer Sidebar** | Collapsible database tree with databases → schemas/collections → tables/views. Shows document counts and supports search filtering. |
| 📋 **Records Viewer** | Paginated table view with TanStack Virtual scrolling. Inline cell editing, column sorting, full-text search, and JSON view. |
| ✏️ **CRUD Operations** | Insert records via dialog, inline cell edits, full JSON editor, and delete with confirmation. |
| 🔍 **Visual Query Builder** | Drag-and-drop filter rules (eq, neq, contains, gt, lt, in, ...) with live query preview. Generates native MongoDB or SQL syntax. |
| ⚡ **Monaco Query Editor** | Advanced raw query mode powered by Monaco Editor (same engine as VS Code). Supports `Ctrl/Cmd+Enter` to execute. |
| 🧮 **Aggregation Builder** | MongoDB aggregation pipeline builder with stage templates (`$match`, `$sort`, `$limit`, `$project`). |
| 🧠 **Schema Intelligence** | Schema viewer with inferred field types, nullability ratios, and observed-count stats. |
| 📐 **Index Management** | View, create, and delete database indexes. Supports unique, sparse, and compound indexes for MongoDB and SQL. |
| ⌨️ **Keyboard Shortcuts** | `Cmd/Ctrl+K` (connection), `Cmd/Ctrl+N` (insert), `Cmd/Ctrl+B` (sidebar toggle), `/` (query mode), `Cmd/Ctrl+Enter` (execute). |
| 🌙 **Dark-first UI** | Premium dark theme with glassmorphism panels, gradient accents, and responsive shell. |
| 🔁 **API-first + Mock Fallback** | All data flows through a typed `services/` layer. Falls back to a realistic mock dataset if the backend is unavailable. |

---

## 🛠 Tech Stack

| Category | Library | Version |
|---|---|---|
| Framework | Next.js (App Router) | `^15.2` |
| Language | TypeScript | `^5.8` |
| Styling | Tailwind CSS | `^3.4` |
| UI Primitives | Radix UI + ShadCN-style | — |
| Server State | TanStack Query | `^5.66` |
| Table | TanStack Table | `^8.21` |
| Virtualization | TanStack Virtual | `^3.11` |
| Global State | Zustand | `^5.0` |
| Code Editor | Monaco Editor | `^0.52` |
| HTTP Client | Axios | `^1.8` |
| Themes | next-themes | `^0.4` |
| Notifications | Sonner | `^2.0` |
| Icons | Lucide React | `^0.511` |

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>=18`
- npm `>=9`

### Installation

```bash
git clone https://github.com/mdtanvirahamedshanto/DBOrbit-Frontend.git
cd DBOrbit-Frontend
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the root directory (see `.env.example`):

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

If `NEXT_PUBLIC_API_BASE_URL` is not set, the app uses the built-in mock data layer so you can explore the UI without a running backend.

### Production Build

```bash
npm run typecheck   # Type-check without emitting
npm run build       # Build for production
npm run start       # Start production server
```

### Lint

```bash
npm run lint
```

---

## 📁 Folder Structure

```text
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout with metadata + providers
│   ├── page.tsx                # Entry page → <AppShell />
│   ├── providers.tsx           # TanStack Query + theme providers
│   └── globals.css             # Design tokens, CSS variables, global utilities
│
├── components/
│   ├── shell/
│   │   ├── app-shell.tsx       # Main layout (sidebar + topbar + content)
│   │   ├── top-bar.tsx         # Header with connection switcher and actions
│   │   └── footer.tsx          # Footer with developer credit
│   └── ui/                     # ShadCN-style reusable primitives
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── code-editor.tsx     # Monaco editor wrapper
│       └── ...
│
├── features/
│   ├── connections/            # Connection management (form, list, switcher)
│   ├── explorer/               # Database tree sidebar
│   ├── records/                # Records table, JSON view, CRUD dialogs
│   ├── query/                  # Visual + Monaco query builder
│   └── advanced/               # Aggregation builder, schema viewer, index manager
│
├── services/                   # API layer (all backend calls + mock fallback)
│   ├── connection-service.ts
│   ├── records-service.ts
│   ├── explorer-service.ts
│   ├── query-service.ts
│   ├── advanced-service.ts
│   └── mock-data.ts
│
├── store/                      # Zustand global state slices
│   ├── ui-store.ts
│   ├── connections-store.ts
│   └── workspace-store.ts
│
├── lib/                        # Utilities and helpers
│   ├── api.ts                  # Axios client with error handling
│   ├── query-keys.ts           # TanStack Query key factory
│   ├── connection.ts           # URI parsing and profile normalization
│   ├── storage.ts              # Session storage for live URIs
│   └── utils.ts                # cn(), formatNumber(), debounce()
│
└── types/
    └── index.ts                # All shared TypeScript types and interfaces
```

---

## 🗺 Development Phases

### Phase 1 — Project Setup & Layout
Next.js App Router scaffold, metadata, providers, theme tokens, Tailwind configuration, and shell layout.

**Key files:** `src/app/*`, `src/components/shell/app-shell.tsx`, `src/components/shell/top-bar.tsx`, `src/components/ui/*`

### Phase 2 — Connection UI
Add, save, and switch database connection profiles. Safe credential persistence: metadata in `localStorage`, live URI in `sessionStorage`.

**Key files:** `src/features/connections/**`, `src/lib/connection.ts`, `src/lib/storage.ts`, `src/store/connections-store.ts`

### Phase 3 — Explorer Sidebar
Expandable database tree for MongoDB, PostgreSQL, and MySQL. Supports document count display, search filtering, and recent/pinned resources.

**Key files:** `src/features/explorer/**`, `src/services/explorer-service.ts`

### Phase 4 — Records Viewer
Paginated record browsing with table view, JSON view, sorting, search, and virtualized rendering for large datasets.

**Key files:** `src/features/records/components/records-panel.tsx`, `src/features/records/components/records-table.tsx`, `src/features/records/components/json-records-view.tsx`

### Phase 5 — CRUD Operations
Full create, read, update, and delete support: insert dialog, inline cell editing, full record JSON editor, and delete confirmation.

**Key files:** `src/features/records/components/record-editor-dialog.tsx`, `src/services/records-service.ts`

### Phase 6 — Query Builder
Visual filter builder with operator support and an advanced Monaco editor mode. Generates and previews native MongoDB or SQL query syntax.

**Key files:** `src/features/query/components/*`, `src/features/query/hooks/use-query-builder.ts`, `src/services/query-service.ts`

### Phase 7 — Advanced Features
MongoDB aggregation pipeline builder, schema viewer with field-level statistics, and index management (create, view, delete) for MongoDB and SQL databases.

**Key files:** `src/features/advanced/components/*`, `src/services/advanced-service.ts`

### Phase 8 — Performance & Polish
TanStack Query result caching, lazy-loaded Monaco editor, virtualized records table, keyboard shortcuts, responsive shell, and API-first services with mock fallback.

**Key files:** `src/app/providers.tsx`, `src/components/ui/code-editor.tsx`, `src/services/mock-data.ts`

---

## 📝 Notes

- The frontend is fully **API-first** — all data operations go through the typed `services/` layer for easy backend substitution.
- If the backend is not running, the app falls back to a **realistic in-browser mock dataset**, keeping the full UI functional during development.
- **Google Fonts are not used** — the build succeeds in offline or network-restricted environments. Fonts (IBM Plex Sans, JetBrains Mono) are loaded from system or bundled sources.
- The **dark premium theme** uses HSL CSS custom properties, making it straightforward to customize or add a light theme variant.

---

## 👨‍💻 Developer

<p>
  Built with ❤️ by <strong>Md Tanvir Ahamed Shanto</strong>
</p>

- 🌐 GitHub: [@mdtanvirahamedshanto](https://github.com/mdtanvirahamedshanto)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
