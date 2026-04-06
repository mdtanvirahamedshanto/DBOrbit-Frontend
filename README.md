# DBOrbit Frontend

Production-grade Next.js frontend for a multi-database admin panel with a DBeaver/TablePlus-style workspace.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- TanStack Query
- TanStack Table
- TanStack Virtual
- Zustand
- Monaco Editor
- Axios
- ShadCN-style component structure

## Run

```bash
npm install
npm run dev
```

Production verification:

```bash
npm run typecheck
npm run build
```

## Folder Structure

```text
src/
  app/
  components/
    shell/
    ui/
  features/
    advanced/
    connections/
    explorer/
    query/
    records/
  lib/
  services/
  store/
  types/
```

## Phase Mapping

### Phase 1: Project setup + layout

- Next.js App Router scaffold, metadata, providers, theme, Tailwind tokens, and shell layout
- Files:
  - `src/app/*`
  - `src/components/shell/app-shell.tsx`
  - `src/components/shell/top-bar.tsx`
  - `src/components/ui/*`

### Phase 2: Connection UI

- Add/save/switch connection profiles
- Safe local persistence: metadata in `localStorage`, live URI in `sessionStorage`
- Files:
  - `src/features/connections/components/*`
  - `src/features/connections/hooks/use-connections.ts`
  - `src/lib/connection.ts`
  - `src/lib/storage.ts`
  - `src/store/connections-store.ts`

### Phase 3: Explorer sidebar

- Expandable database tree for MongoDB, PostgreSQL, and MySQL
- Files:
  - `src/features/explorer/components/explorer-tree.tsx`
  - `src/features/explorer/hooks/use-explorer-tree.ts`
  - `src/services/explorer-service.ts`

### Phase 4: Records viewer

- Paginated record browsing
- Table view, JSON view, sorting, search, virtualization
- Files:
  - `src/features/records/components/records-panel.tsx`
  - `src/features/records/components/records-table.tsx`
  - `src/features/records/components/json-records-view.tsx`
  - `src/features/records/hooks/use-records.ts`

### Phase 5: CRUD UI

- Insert dialog
- Inline cell editing
- Full record JSON editing
- Delete confirmation
- Files:
  - `src/features/records/components/record-editor-dialog.tsx`
  - `src/features/records/components/records-table.tsx`
  - `src/services/records-service.ts`

### Phase 6: Query builder

- Visual filter builder
- Advanced Monaco editor mode
- Generated query preview and result preview
- Files:
  - `src/features/query/components/*`
  - `src/features/query/hooks/use-query-builder.ts`
  - `src/services/query-service.ts`

### Phase 7: Advanced features

- MongoDB aggregation builder
- Schema viewer with field stats
- Index management UI
- Files:
  - `src/features/advanced/components/*`
  - `src/services/advanced-service.ts`

### Phase 8: Performance + polish

- React Query caching
- Lazy-loaded Monaco
- Virtualized records table
- Keyboard shortcuts
- Responsive shell
- API-first services with mock fallback for local UX
- Files:
  - `src/app/providers.tsx`
  - `src/components/ui/code-editor.tsx`
  - `src/features/records/components/records-table.tsx`
  - `src/components/shell/app-shell.tsx`
  - `src/services/mock-data.ts`

## Notes

- The frontend is wired API-first through the `services/` layer.
- If the backend endpoints are not available yet, the app falls back to a realistic in-browser mock dataset so the UI remains usable during development.
- Google-hosted fonts were intentionally avoided in the final build path so production builds succeed in offline or restricted environments.
