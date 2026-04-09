import type { Task } from '../types/task';
import { CURRENT_SCHEMA_VERSION, migrate, type StorageData } from './migrations';

const STORAGE_KEY = 'team-workflow-board';

export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function loadTasks(): { tasks: Task[]; migrated: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return { tasks: [], migrated: false };
    }

    const parsed: unknown = JSON.parse(raw);
    const { data, migrated } = migrate(parsed);

    // If migration occurred, save the migrated data
    if (migrated) {
      saveTasks(data.tasks);
    }

    return { tasks: data.tasks, migrated };
  } catch {
    return { tasks: [], migrated: false };
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    const data: StorageData = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      tasks,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Silently fail if storage is full or unavailable
  }
}
