import { useState, useCallback, useRef, useEffect } from 'react';
import type { Task, TaskFormData } from '../types/task';

interface FormErrors {
  title?: string;
  description?: string;
  assignee?: string;
}

interface UseTaskFormReturn {
  formData: TaskFormData;
  errors: FormErrors;
  isDirty: boolean;
  handleChange: (field: keyof TaskFormData, value: string) => void;
  handleTagsChange: (tags: string[]) => void;
  validate: () => boolean;
  reset: () => void;
}

function getDefaults(): TaskFormData {
  return {
    title: '',
    description: '',
    status: 'Backlog',
    priority: 'Medium',
    assignee: '',
    tags: [],
    dueDate: '',
  };
}

function formDataFromTask(task: Task): TaskFormData {
  return {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assignee: task.assignee,
    tags: [...task.tags],
    dueDate: task.dueDate ?? '',
  };
}

function isFormDirty(current: TaskFormData, initial: TaskFormData): boolean {
  if (current.title !== initial.title) return true;
  if (current.description !== initial.description) return true;
  if (current.status !== initial.status) return true;
  if (current.priority !== initial.priority) return true;
  if (current.assignee !== initial.assignee) return true;
  if (current.dueDate !== initial.dueDate) return true;
  if (current.tags.length !== initial.tags.length) return true;
  for (let i = 0; i < current.tags.length; i++) {
    if (current.tags[i] !== initial.tags[i]) return true;
  }
  return false;
}

export function useTaskForm(initialTask?: Task): UseTaskFormReturn {
  const initial = initialTask ? formDataFromTask(initialTask) : getDefaults();
  const initialRef = useRef(initial);
  const [formData, setFormData] = useState<TaskFormData>(initial);
  const [errors, setErrors] = useState<FormErrors>({});

  // Re-initialize when the backing task changes (edit mode)
  const taskId = initialTask?.id;
  useEffect(() => {
    const newInitial = initialTask ? formDataFromTask(initialTask) : getDefaults();
    initialRef.current = newInitial;
    setFormData(newInitial);
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const isDirty = isFormDirty(formData, initialRef.current);

  const handleChange = useCallback((field: keyof TaskFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (prev[field as keyof FormErrors]) {
        const next = { ...prev };
        delete next[field as keyof FormErrors];
        return next;
      }
      return prev;
    });
  }, []);

  const handleTagsChange = useCallback((tags: string[]) => {
    setFormData((prev) => ({ ...prev, tags }));
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    const trimmedTitle = formData.title.trim();
    if (!trimmedTitle) {
      newErrors.title = 'Title is required';
    } else if (trimmedTitle.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (trimmedTitle.length > 100) {
      newErrors.title = 'Title must be 100 characters or fewer';
    }

    if (formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or fewer';
    }

    if (formData.assignee.length > 50) {
      newErrors.assignee = 'Assignee must be 50 characters or fewer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const reset = useCallback(() => {
    setFormData(initialRef.current);
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    isDirty,
    handleChange,
    handleTagsChange,
    validate,
    reset,
  };
}
