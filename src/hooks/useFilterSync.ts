import { useEffect, useRef } from 'react';
import { useTaskStore } from '../features/tasks/store';
import { DEFAULT_FILTERS } from '../types/task';
import type { TaskStatus, TaskPriority, SortField, SortDirection, TaskFilters } from '../types/task';

const VALID_STATUSES: TaskStatus[] = ['Backlog', 'In Progress', 'Done'];
const VALID_PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High'];
const VALID_SORT_FIELDS: SortField[] = ['createdAt', 'updatedAt', 'priority'];
const VALID_SORT_DIRECTIONS: SortDirection[] = ['asc', 'desc'];

function parseStatusParam(value: string | null): TaskStatus[] | undefined {
  if (!value) return undefined;
  const statuses = value.split(',').map((s) => s.trim());
  const valid = statuses.filter((s): s is TaskStatus =>
    VALID_STATUSES.includes(s as TaskStatus),
  );
  return valid.length > 0 ? valid : undefined;
}

function parsePriorityParam(value: string | null): TaskPriority | null | undefined {
  if (!value) return undefined;
  return VALID_PRIORITIES.includes(value as TaskPriority)
    ? (value as TaskPriority)
    : undefined;
}

function parseSortFieldParam(value: string | null): SortField | undefined {
  if (!value) return undefined;
  return VALID_SORT_FIELDS.includes(value as SortField)
    ? (value as SortField)
    : undefined;
}

function parseSortDirParam(value: string | null): SortDirection | undefined {
  if (!value) return undefined;
  return VALID_SORT_DIRECTIONS.includes(value as SortDirection)
    ? (value as SortDirection)
    : undefined;
}

function filtersToSearchParams(filters: TaskFilters): URLSearchParams {
  const params = new URLSearchParams();

  // Only add non-default values
  if (
    filters.status.length !== DEFAULT_FILTERS.status.length ||
    !filters.status.every((s) => DEFAULT_FILTERS.status.includes(s))
  ) {
    params.set('status', filters.status.join(','));
  }

  if (filters.priority !== null) {
    params.set('priority', filters.priority);
  }

  if (filters.search.trim() !== '') {
    params.set('search', filters.search);
  }

  if (filters.sortField !== DEFAULT_FILTERS.sortField) {
    params.set('sort', filters.sortField);
  }

  if (filters.sortDirection !== DEFAULT_FILTERS.sortDirection) {
    params.set('dir', filters.sortDirection);
  }

  return params;
}

export function useFilterSync(): void {
  const setFilters = useTaskStore((state) => state.setFilters);
  const initializedRef = useRef(false);

  // On mount: read URL and apply to store
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const updates: Partial<TaskFilters> = {};

    const status = parseStatusParam(params.get('status'));
    if (status !== undefined) updates.status = status;

    const priority = parsePriorityParam(params.get('priority'));
    if (priority !== undefined) updates.priority = priority;

    const search = params.get('search');
    if (search !== null) updates.search = search;

    const sortField = parseSortFieldParam(params.get('sort'));
    if (sortField !== undefined) updates.sortField = sortField;

    const sortDir = parseSortDirParam(params.get('dir'));
    if (sortDir !== undefined) updates.sortDirection = sortDir;

    if (Object.keys(updates).length > 0) {
      setFilters(updates);
    }
  }, [setFilters]);

  // Subscribe to filter changes and update URL
  useEffect(() => {
    let prevFiltersJson = JSON.stringify(useTaskStore.getState().filters);

    const unsubscribe = useTaskStore.subscribe((state) => {
      const currentJson = JSON.stringify(state.filters);
      if (currentJson === prevFiltersJson) return;
      prevFiltersJson = currentJson;

      const params = filtersToSearchParams(state.filters);
      const search = params.toString();
      const newUrl = search
        ? `${window.location.pathname}?${search}`
        : window.location.pathname;
      window.history.replaceState(null, '', newUrl);
    });

    return unsubscribe;
  }, []);
}
