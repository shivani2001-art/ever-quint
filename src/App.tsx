import { useState, useEffect, useMemo, useCallback } from 'react';
import { Moon, Sun, Plus, Layers, HelpCircle } from 'lucide-react';
import { ToastProvider, useToast } from './components/ui';
import { Board } from './components/board';
import { TaskForm } from './components/board/TaskForm';
import { TaskDetail } from './components/board/TaskDetail';
import { DeleteConfirmation } from './components/board/DeleteConfirmation';
import { FilterBar } from './components/board/FilterBar';
import { EmptyState } from './components/board/EmptyState';
import { OnboardingFlow } from './components/board/OnboardingFlow';
import { useTaskStore } from './features/tasks/store';
import { useFilterSync } from './hooks/useFilterSync';
import { useTheme } from './hooks/useTheme';
import type { Task, TaskFormData, TaskStatus } from './types/task';
import styles from './App.module.css';

function AppContent() {
  const migrationNotice = useTaskStore((state) => state.migrationNotice);
  const dismissMigrationNotice = useTaskStore((state) => state.dismissMigrationNotice);
  const storageAvailable = useTaskStore((state) => state.storageAvailable);
  const tasks = useTaskStore((state) => state.tasks);
  const filters = useTaskStore((state) => state.filters);
  const getFilteredAndSortedTasks = useTaskStore((state) => state.getFilteredAndSortedTasks);
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const moveTask = useTaskStore((state) => state.moveTask);
  const { addToast } = useToast();

  const { resolvedTheme, toggleTheme } = useTheme();
  useFilterSync();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [tourKey, setTourKey] = useState(0);
  const [tourActive, setTourActive] = useState(() => {
    try { return !localStorage.getItem('everquint-onboarding'); } catch { return true; }
  });
  const handleTourFinish = useCallback(() => setTourActive(false), []);

  useEffect(() => {
    if (migrationNotice) {
      addToast(migrationNotice, 'info');
      dismissMigrationNotice();
    }
  }, [migrationNotice, dismissMigrationNotice, addToast]);

  useEffect(() => {
    if (!storageAvailable) {
      addToast('Storage unavailable. Changes will not be saved between sessions.', 'error', 6000);
    }
  }, [storageAvailable, addToast]);

  const handleCreateSubmit = (data: TaskFormData) => {
    addTask(data);
    setIsCreateModalOpen(false);
    addToast('Task created successfully', 'success');
  };

  const handleEditSubmit = (data: TaskFormData) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
      setEditingTask(null);
      addToast('Task updated successfully', 'success');
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingTask) {
      deleteTask(deletingTask.id);
      setDeletingTask(null);
      setEditingTask(null);
      setViewingTask(null);
      addToast('Task deleted', 'info');
    }
  };

  const handleViewEdit = () => {
    if (viewingTask) {
      setEditingTask(viewingTask);
      setViewingTask(null);
    }
  };

  const handleDetailStatusChange = (id: string, status: TaskStatus) => {
    moveTask(id, status);
    setViewingTask(null);
    addToast(`Task moved to ${status}`, 'success');
  };

  const filteredTasks = useMemo(
    () => getFilteredAndSortedTasks(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tasks, filters, getFilteredAndSortedTasks],
  );
  const hasNoTasks = tasks.length === 0;
  const hasNoMatches = !hasNoTasks && filteredTasks.length === 0;

  const openCreateModal = () => setIsCreateModalOpen(true);

  const doneCount = tasks.filter(t => t.status === 'Done').length;
  const progress = tasks.length > 0 ? (doneCount / tasks.length) * 100 : 0;

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logoMark} aria-hidden="true">
            <Layers size={15} strokeWidth={2.5} />
          </div>
          <h1 className={styles.title}>EverQuint</h1>
        </div>
        {tasks.length > 0 && (
          <div className={styles.headerCenter}>
            <span className={styles.progressLabel}>{doneCount}/{tasks.length} done</span>
            <div className={styles.progressTrack} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Tasks completed">
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.themeToggle}
            onClick={() => {
              try { localStorage.removeItem('everquint-onboarding'); } catch { /* ignore */ }
              setTourKey((k) => k + 1);
              setTourActive(true);
            }}
            aria-label="Take a tour"
            data-onboarding="help-button"
          >
            <HelpCircle size={16} />
          </button>
          <button
            type="button"
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
            data-onboarding="theme-toggle"
          >
            {resolvedTheme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button type="button" className={styles.newTaskButton} onClick={openCreateModal} data-onboarding="new-task">
            <Plus size={14} strokeWidth={2.5} aria-hidden="true" />
            New Task
          </button>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.toolbar}>
          <nav aria-label="Task filters" className={styles.toolbarFilters} data-onboarding="filters">
            <FilterBar />
          </nav>
        </div>

        <main className={styles.main}>
          {!storageAvailable && (
            <EmptyState type="storage-unavailable" />
          )}

          {hasNoMatches && (
            <EmptyState type="no-matches" />
          )}

          {!hasNoMatches && (
            <Board onEditTask={setViewingTask} />
          )}
        </main>
      </div>

      {viewingTask && (
        <TaskDetail
          task={viewingTask}
          onEdit={handleViewEdit}
          onClose={() => setViewingTask(null)}
          onStatusChange={handleDetailStatusChange}
        />
      )}

      <TaskForm
        isOpen={isCreateModalOpen}
        onSubmit={handleCreateSubmit}
        onCancel={() => setIsCreateModalOpen(false)}
      />

      <TaskForm
        isOpen={editingTask !== null}
        task={editingTask ?? undefined}
        onSubmit={handleEditSubmit}
        onCancel={() => setEditingTask(null)}
        onDelete={() => {
          if (editingTask) setDeletingTask(editingTask);
        }}
      />

      <DeleteConfirmation
        isOpen={deletingTask !== null}
        taskTitle={deletingTask?.title ?? ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingTask(null)}
      />

      <OnboardingFlow key={tourKey} hasTasks={!hasNoTasks} active={tourActive} onFinish={handleTourFinish} />
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
