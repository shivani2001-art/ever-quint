import type { Task } from '../types/task';

export const CURRENT_SCHEMA_VERSION = 2;

export interface StorageData {
  schemaVersion: number;
  tasks: Task[];
}

type MigrationFn = (data: unknown) => StorageData;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function ensureTaskDefaults(task: Record<string, unknown>): Task {
  const now = new Date().toISOString();
  return {
    id: typeof task['id'] === 'string' ? task['id'] : `migrated-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title: typeof task['title'] === 'string' ? task['title'] : 'Untitled Task',
    description: typeof task['description'] === 'string' ? task['description'] : '',
    status: (['Backlog', 'In Progress', 'Done'] as const).includes(task['status'] as Task['status'])
      ? (task['status'] as Task['status'])
      : 'Backlog',
    priority: (['Low', 'Medium', 'High'] as const).includes(task['priority'] as Task['priority'])
      ? (task['priority'] as Task['priority'])
      : 'Medium',
    assignee: typeof task['assignee'] === 'string' ? task['assignee'] : '',
    tags: Array.isArray(task['tags']) ? (task['tags'] as unknown[]).filter((t): t is string => typeof t === 'string') : [],
    dueDate: typeof task['dueDate'] === 'string' ? task['dueDate'] : '',
    createdAt: typeof task['createdAt'] === 'string' ? task['createdAt'] : now,
    updatedAt: typeof task['updatedAt'] === 'string' ? task['updatedAt'] : now,
    completedAt: typeof task['completedAt'] === 'string' ? task['completedAt'] : (task['status'] === 'Done' && typeof task['updatedAt'] === 'string' ? task['updatedAt'] as string : ''),
  };
}

const migrations: Record<number, MigrationFn> = {
  1: (data: unknown): StorageData => {
    // Migration from v0 (unversioned) to v1
    let tasks: Task[] = [];

    if (Array.isArray(data)) {
      // Bare array of tasks
      tasks = data.map((item) => {
        if (isRecord(item)) {
          return ensureTaskDefaults(item);
        }
        return ensureTaskDefaults({});
      });
    } else if (isRecord(data) && Array.isArray(data['tasks'])) {
      // Object with tasks array but no schemaVersion
      tasks = (data['tasks'] as unknown[]).map((item) => {
        if (isRecord(item)) {
          return ensureTaskDefaults(item);
        }
        return ensureTaskDefaults({});
      });
    }

    return { schemaVersion: 1, tasks };
  },
  2: (data: unknown): StorageData => {
    // Migration from v1 to v2: add dueDate and completedAt
    if (isRecord(data) && Array.isArray(data['tasks'])) {
      const tasks = (data['tasks'] as unknown[]).map((item) => {
        if (isRecord(item)) {
          return ensureTaskDefaults(item);
        }
        return ensureTaskDefaults({});
      });
      return { schemaVersion: 2, tasks };
    }
    return { schemaVersion: 2, tasks: [] };
  },
};

export function migrate(rawData: unknown): { data: StorageData; migrated: boolean } {
  let currentVersion = 0;
  let currentData: unknown = rawData;

  if (isRecord(rawData) && typeof rawData['schemaVersion'] === 'number') {
    currentVersion = rawData['schemaVersion'];
  }

  if (currentVersion >= CURRENT_SCHEMA_VERSION) {
    // Already at or beyond current version
    if (isRecord(rawData) && Array.isArray(rawData['tasks'])) {
      return {
        data: { schemaVersion: currentVersion, tasks: rawData['tasks'] as Task[] },
        migrated: false,
      };
    }
    // Invalid shape even though version matches — run migration
    currentVersion = 0;
  }

  let migrated = false;

  for (let version = currentVersion + 1; version <= CURRENT_SCHEMA_VERSION; version++) {
    const migrationFn = migrations[version];
    if (migrationFn) {
      const result = migrationFn(currentData);
      currentData = result;
      migrated = true;
    }
  }

  return {
    data: currentData as StorageData,
    migrated,
  };
}
