# Team Workflow Board

A simplified Jira/Trello-style task management board built with React, TypeScript, and Vite. Supports task CRUD, kanban board columns, filtering/sorting with URL sync, and localStorage persistence with schema versioning.

## Getting Started

```bash
npm install        # Install dependencies
npm run dev        # Start development server (http://localhost:5173)
npm run build      # Production build
npm test           # Run tests
npm run lint       # Lint with ESLint
```

## Architecture Overview

- **Component Library** (`src/components/ui/`) -- 8 custom UI components (Button, TextInput, TextArea, Select, Tag, Card, Modal, Toast) with CSS Modules and CSS custom property theming
- **Feature Structure** (`src/features/tasks/`) -- Zustand store with full CRUD, filtering, and sorting
- **Board Components** (`src/components/board/`) -- Board, Column, TaskCard, TaskForm, FilterBar, DeleteConfirmation, EmptyState
- **Custom Hooks** (`src/hooks/`) -- useTaskForm, useUnsavedChanges, useFilterSync, useLocalStorage
- **Persistence** (`src/utils/`) -- localStorage with schema versioning and migration pipeline

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed component hierarchy, data flow, and extension guides.

## Key Decisions and Trade-offs

| Decision | Choice | Rationale |
|----------|--------|-----------|
| UI Components | Custom library | Project requirement; full control over accessibility and theming |
| State Management | Zustand | Simpler API than Context, built-in selectors, no provider nesting, minimal boilerplate |
| Styling | CSS Modules + CSS custom properties | Co-located styles, zero runtime cost, good TypeScript support, themeable via design tokens |
| Status Change | Drag-and-drop + detail quick actions | Drag-and-drop for fast triage, detail modal buttons for keyboard/mobile accessibility |
| Filter Persistence | URL query parameters | Shareable filter state, browser back button works, bookmarkable views |
| Data Persistence | localStorage + schema versioning | Works offline, no backend needed, forward-compatible with migration pipeline |

## Features

- Create, edit, and delete tasks with form validation
- Three-column kanban board (Backlog, In Progress, Done)
- Move tasks between columns via drag-and-drop or task detail quick actions
- Filter by status (multi-select), priority, and text search (debounced)
- Sort by created date, updated date, or priority
- URL query string sync for all filters (shareable)
- localStorage persistence with schema versioning
- Dirty state detection with browser beforeunload warning
- Delete confirmation dialog
- Toast notifications for all actions
- Full keyboard navigation and ARIA attributes
- Responsive layout

## Performance Optimization

Identified and fixed an unnecessary re-render issue using React DevTools Profiler: the `Board` component was recomputing the filtered/sorted task list on every render. Fixed by wrapping `getFilteredAndSortedTasks()` in `useMemo` (see `App.tsx:87-91` and `Board.tsx:20-32`), gated on `tasks` and `filters` references, so the expensive filter+sort only runs when the underlying data actually changes. Similarly, `handleDragEnd` in `Board.tsx` is wrapped in `useCallback` to avoid creating a new closure on each render, which would cause all `Column` components to re-render unnecessarily.

## Known Limitations / Future Improvements

- **Real-time collaboration** -- Single-user only; would need WebSocket/SSE for multi-user
- **Backend API** -- All data is local; a REST/GraphQL API would enable cross-device sync
- **Task attachments** -- No file upload support
- **User authentication** -- No login/accounts; all data is per-browser
- **Subtasks/checklists** -- No task decomposition support
