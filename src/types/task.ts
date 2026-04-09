export type TaskStatus = 'Backlog' | 'In Progress' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  tags: string[];
  dueDate: string; // ISO 8601 date or empty string
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  completedAt: string; // ISO 8601 or empty string
}

export type TaskFormData = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>;

export type SortField = 'createdAt' | 'updatedAt' | 'priority';
export type SortDirection = 'asc' | 'desc';

export interface TaskFilters {
  status: TaskStatus[];
  priority: TaskPriority | null;
  search: string;
  sortField: SortField;
  sortDirection: SortDirection;
}

export const DEFAULT_FILTERS: TaskFilters = {
  status: ['Backlog', 'In Progress', 'Done'],
  priority: null,
  search: '',
  sortField: 'createdAt',
  sortDirection: 'desc',
};
