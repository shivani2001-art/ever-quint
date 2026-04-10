import { useState, useCallback } from 'react';

const STORAGE_KEY = 'everquint-onboarding';

export type OnboardingStep =
  | 'welcome'
  | 'create-task'
  | 'board-columns'
  | 'drag-drop'
  | 'task-detail'
  | 'filters'
  | 'theme';

interface OnboardingState {
  completed: OnboardingStep[];
  dismissed: boolean;
}

function loadState(): OnboardingState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { completed: [], dismissed: false };
}

function saveState(state: OnboardingState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(loadState);

  const isCompleted = useCallback(
    (step: OnboardingStep) => state.completed.includes(step),
    [state.completed],
  );

  const completeStep = useCallback((step: OnboardingStep) => {
    setState((prev) => {
      if (prev.completed.includes(step)) return prev;
      const next = { ...prev, completed: [...prev.completed, step] };
      saveState(next);
      return next;
    });
  }, []);

  const dismissAll = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, dismissed: true };
      saveState(next);
      return next;
    });
  }, []);

  const resetOnboarding = useCallback(() => {
    const next: OnboardingState = { completed: [], dismissed: false };
    saveState(next);
    setState(next);
  }, []);

  return {
    isCompleted,
    isDismissed: state.dismissed,
    completedCount: state.completed.length,
    completeStep,
    dismissAll,
    resetOnboarding,
  };
}
