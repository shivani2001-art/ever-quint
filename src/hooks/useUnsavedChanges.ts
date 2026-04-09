import { useEffect, useCallback } from 'react';

export function useUnsavedChanges(isDirty: boolean, enabled: boolean = true) {
  useEffect(() => {
    if (!isDirty || !enabled) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handler);
    return () => {
      window.removeEventListener('beforeunload', handler);
    };
  }, [isDirty, enabled]);

  const confirmDiscard = useCallback((): boolean => {
    if (!isDirty) return true;
    return window.confirm('You have unsaved changes. Discard them?');
  }, [isDirty]);

  return { confirmDiscard };
}
