# Architecture

## Component Hierarchy

```
App
|-- ToastProvider
    |-- AppContent
        |-- Header
        |   |-- h1 "Team Workflow Board"
        |   |-- Button "New Task"
        |-- nav (FilterBar)
        |   |-- StatusToggle (x3: Backlog, In Progress, Done)
        |   |-- PrioritySelect
        |   |-- SearchInput (debounced)
        |   |-- SortSelect
        |   |-- ClearFilters + ActiveCount
        |-- main
        |   |-- EmptyState (no-tasks | no-matches | storage-unavailable)
        |   |-- Board (DragDropContext)
        |       |-- Column (x3, Droppable)
        |           |-- TaskCard (xN, Draggable)
        |               |-- Card (clickable → opens TaskDetail)
        |               |-- Priority stripe + badge
        |               |-- Tag pills (xN)
        |               |-- Avatar + assignee + timestamp
        |-- Modal (task detail)
        |   |-- TaskDetail
        |       |-- Status/Priority badges
        |       |-- Meta grid (assignee, tags, dates)
        |       |-- Quick action buttons (move to other statuses)
        |-- Modal (create)
        |   |-- TaskForm
        |       |-- TextInput (title)
        |       |-- TextArea (description)
        |       |-- Select (status)
        |       |-- Select (priority)
        |       |-- TextInput (assignee)
        |       |-- TextInput + Button (tags input)
        |       |-- Tag (xN, removable)
        |-- Modal (edit)
        |   |-- TaskForm (pre-filled)
        |-- Modal (delete)
            |-- DeleteConfirmation
```

## Data Flow

```
User Action
  -> React event handler
  -> Zustand store action (addTask / updateTask / deleteTask / moveTask / setFilters)
  -> Zustand state update
  -> React re-render (components subscribe to specific state slices)
  -> localStorage save (on every mutation via persistTasks)
```

Filter changes flow through URL sync:

```
User changes filter
  -> FilterBar calls store.setFilters()
  -> useFilterSync subscription detects change
  -> window.history.replaceState() updates URL
  
Page load with query params:
  -> useFilterSync reads URL on mount
  -> store.setFilters() applies URL values
  -> Board renders with filtered tasks
```

## Storage Versioning Strategy

All task data is stored in localStorage under the key `team-workflow-board` with a schema version:

```json
{
  "schemaVersion": 2,
  "tasks": [...]
}
```

### Migration Pipeline

The migration system in `src/utils/migrations.ts` supports forward migration from any version:

1. On load, `loadTasks()` reads raw JSON from localStorage
2. `migrate()` checks the `schemaVersion` field
3. If the version is less than `CURRENT_SCHEMA_VERSION`, migrations run sequentially
4. Each migration transforms the data shape and returns a valid `StorageData`
5. If migration occurred, the migrated data is saved back to localStorage
6. A `migrationNotice` is shown as a toast notification

### Implemented Migrations

- **v1**: Converts unversioned/bare array data into `{ schemaVersion: 1, tasks: [...] }` format
- **v2**: Adds `dueDate` and `completedAt` fields to all tasks (both default to empty string)

### How to Add a v3 Migration

1. **Update the Task type** in `src/types/task.ts` with the new field
2. **Bump `CURRENT_SCHEMA_VERSION`** to 3 in `src/utils/migrations.ts`
3. **Add a migration function** keyed by `3` in the `migrations` record that transforms v2 data into v3 shape
4. **Update `ensureTaskDefaults()`** to include the new field's default value
5. **Update components** to use the new field

Users with older data will automatically be migrated on next page load.

## Styling Approach

### CSS Modules + CSS Custom Properties

Every component has a co-located `.module.css` file. Styles use CSS custom properties defined in `src/index.css` for consistent theming:

```css
/* Component uses theme tokens */
.button {
  background-color: var(--color-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
}
```

### Token Naming Convention

| Prefix | Purpose | Example |
|--------|---------|---------|
| `--color-*` | Colors | `--color-primary`, `--color-text-secondary` |
| `--radius-*` | Border radii | `--radius-sm`, `--radius-md` |
| `--shadow-*` | Box shadows | `--shadow-sm`, `--shadow-lg` |
| `--spacing-*` | Spacing/padding | `--spacing-xs` through `--spacing-xl` |
| `--font-*` | Typography | `--font-sans` |
| `--color-priority-*` | Priority indicators | `--color-priority-high` |

## Testing Strategy

Tests use **React Testing Library** with **Jest** and follow these principles:

- **Accessible queries first**: `getByRole`, `getByLabelText`, `getByPlaceholderText`
- **User-event for interactions**: `userEvent.setup()` for realistic event simulation
- **waitFor for async assertions**: Handle React state updates and re-renders
- **Store reset between tests**: `useTaskStore.setState()` prevents state leakage
- **Mock setup**: localStorage, `window.history.replaceState`, `crypto.randomUUID`

### Test Files

- `src/test/workflow.test.tsx` -- Core workflows: create task, view on board, move between columns
- `src/test/filters.test.tsx` -- Filtering: status toggles, text search with debounce, priority filter

## Refactoring Example: Adding React Router

To extract the board into a separate route:

1. **Install React Router**: `npm install react-router-dom`

2. **Create route components**:
   ```
   src/pages/BoardPage.tsx    -- Current Board + FilterBar content
   src/pages/TaskDetailPage.tsx -- Full task view with edit form
   ```

3. **Set up router in App.tsx**:
   ```tsx
   import { BrowserRouter, Routes, Route } from 'react-router-dom';

   function App() {
     return (
       <BrowserRouter>
         <ToastProvider>
           <Routes>
             <Route path="/" element={<BoardPage />} />
             <Route path="/task/:id" element={<TaskDetailPage />} />
           </Routes>
         </ToastProvider>
       </BrowserRouter>
     );
   }
   ```

4. **Update filter sync**: Replace `window.history.replaceState` with `useSearchParams` from React Router

5. **Update TaskCard**: Replace edit button onClick with `<Link to={`/task/${task.id}`}>` for navigation

6. **Zustand store remains unchanged** -- it's decoupled from routing
