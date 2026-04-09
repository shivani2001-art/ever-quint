import { create } from 'zustand';
import type { Task, TaskFormData, TaskStatus, TaskFilters, TaskPriority } from '../../types/task';
import { DEFAULT_FILTERS } from '../../types/task';
import { generateId } from '../../utils/ids';
import { loadTasks, saveTasks, isStorageAvailable } from '../../utils/storage';

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
};

interface TaskStore {
  tasks: Task[];
  filters: TaskFilters;
  storageAvailable: boolean;
  migrationNotice: string | null;

  // Actions
  addTask: (data: TaskFormData) => void;
  updateTask: (id: string, data: Partial<TaskFormData>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  dismissMigrationNotice: () => void;

  // Selectors
  getFilteredAndSortedTasks: () => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTaskById: (id: string) => Task | undefined;
}

function persistTasks(tasks: Task[]): void {
  saveTasks(tasks);
}

// Initialize from storage
const { tasks: initialTasks, migrated } = loadTasks();

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: initialTasks,
  filters: { ...DEFAULT_FILTERS },
  storageAvailable: isStorageAvailable(),
  migrationNotice: migrated
    ? 'Your task data was migrated to the latest format.'
    : null,

  addTask: (data: TaskFormData) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      completedAt: data.status === 'Done' ? now : '',
    };
    set((state) => {
      const tasks = [...state.tasks, newTask];
      persistTasks(tasks);
      return { tasks };
    });
  },

  updateTask: (id: string, data: Partial<TaskFormData>) => {
    const now = new Date().toISOString();
    set((state) => {
      const tasks = state.tasks.map((task) => {
        if (task.id !== id) return task;
        const updated = { ...task, ...data, updatedAt: now };
        if (data.status === 'Done' && task.status !== 'Done') {
          updated.completedAt = now;
        } else if (data.status && data.status !== 'Done') {
          updated.completedAt = '';
        }
        return updated;
      });
      persistTasks(tasks);
      return { tasks };
    });
  },

  deleteTask: (id: string) => {
    set((state) => {
      const tasks = state.tasks.filter((task) => task.id !== id);
      persistTasks(tasks);
      return { tasks };
    });
  },

  moveTask: (id: string, status: TaskStatus) => {
    const now = new Date().toISOString();
    set((state) => {
      const tasks = state.tasks.map((task) => {
        if (task.id !== id) return task;
        return {
          ...task,
          status,
          updatedAt: now,
          completedAt: status === 'Done' ? now : '',
        };
      });
      persistTasks(tasks);
      return { tasks };
    });
  },

  setFilters: (newFilters: Partial<TaskFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  dismissMigrationNotice: () => {
    set({ migrationNotice: null });
  },

  getFilteredAndSortedTasks: () => {
    const { tasks, filters } = get();

    let filtered = tasks;

    // Status filter
    if (filters.status.length > 0 && filters.status.length < 3) {
      filtered = filtered.filter((task) => filters.status.includes(task.status));
    }

    // Priority filter
    if (filters.priority !== null) {
      filtered = filtered.filter((task) => task.priority === filters.priority);
    }

    // Text search
    if (filters.search.trim() !== '') {
      const query = filters.search.toLowerCase().trim();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query),
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (filters.sortField) {
        case 'createdAt':
          comparison = a.createdAt.localeCompare(b.createdAt);
          break;
        case 'updatedAt':
          comparison = a.updatedAt.localeCompare(b.updatedAt);
          break;
        case 'priority':
          comparison = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
          break;
      }

      return filters.sortDirection === 'desc' ? -comparison : comparison;
    });

    return sorted;
  },

  getTasksByStatus: (status: TaskStatus) => {
    return get().getFilteredAndSortedTasks().filter((task) => task.status === status);
  },

  getTaskById: (id: string) => {
    return get().tasks.find((task) => task.id === id);
  },
}));
