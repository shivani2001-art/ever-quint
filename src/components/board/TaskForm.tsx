import { useState, type FormEvent } from 'react';
import { Trash2, Check } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Tag } from '../ui/Tag';
import { useTaskForm } from '../../hooks/useTaskForm';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { getTagColor } from '../../utils/tagColors';
import type { Task, TaskFormData } from '../../types/task';
import styles from './TaskForm.module.css';

const STATUS_OPTIONS = [
  { value: 'Backlog', label: 'Backlog' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Done', label: 'Done' },
];

const PRIORITY_OPTIONS = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
];

const PRIORITY_COLORS: Record<string, string> = {
  Low: '#71717A',
  Medium: '#F59E0B',
  High: '#EF4444',
};

interface TaskFormProps {
  isOpen: boolean;
  task?: Task;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

function TaskForm({ isOpen, task, onSubmit, onCancel, onDelete }: TaskFormProps) {
  const { formData, errors, isDirty, handleChange, handleTagsChange, validate, reset } =
    useTaskForm(task);
  const { confirmDiscard } = useUnsavedChanges(isDirty, isOpen);
  const [tagInput, setTagInput] = useState('');

  const isEditMode = task !== undefined;

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (validate()) {
      onSubmit(formData);
      reset();
    }
  };

  const handleCancel = () => {
    if (!isDirty || confirmDiscard()) {
      reset();
      onCancel();
    }
  };

  const [tagError, setTagError] = useState('');

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (formData.tags.includes(trimmed)) {
      setTagError(`"${trimmed}" already exists`);
      return;
    }
    handleTagsChange([...formData.tags, trimmed]);
    setTagInput('');
    setTagError('');
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Backspace' && tagInput === '' && formData.tags.length > 0) {
      handleRemoveTag(formData.tags[formData.tags.length - 1]!);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleTagsChange(formData.tags.filter((t) => t !== tagToRemove));
  };

  const footer = (
    <div className={styles.footer}>
      <div className={styles.footerLeft}>
        {isEditMode && onDelete && (
          <Button variant="destructive" onClick={onDelete}>
            <Trash2 size={13} aria-hidden="true" />
            Delete
          </Button>
        )}
      </div>
      <div className={styles.footerRight}>
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={() => handleSubmit()}>
          <Check size={13} strokeWidth={2.5} aria-hidden="true" />
          {isEditMode ? 'Save Changes' : 'Create Task'}
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={isEditMode ? 'Edit Task' : 'Create Task'}
      footer={footer}
    >
      <form id="task-form" onSubmit={handleSubmit} className={styles.form}>
        <TextInput
          label="Title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          error={errors.title}
          required
          placeholder="Enter task title"
        />

        <TextArea
          label="Description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          error={errors.description}
          placeholder="Describe the task..."
          rows={3}
        />

        <div className={styles.row}>
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
          />

          <div className={styles.priorityField}>
            <Select
              label="Priority"
              options={PRIORITY_OPTIONS}
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
            />
            <span
              className={styles.priorityDot}
              style={{ backgroundColor: PRIORITY_COLORS[formData.priority] }}
            />
          </div>
        </div>

        <div className={styles.row}>
          <TextInput
            label="Assignee"
            value={formData.assignee}
            onChange={(e) => handleChange('assignee', e.target.value)}
            error={errors.assignee}
            placeholder="Who is responsible?"
          />

          <TextInput
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleChange('dueDate', e.target.value)}
          />
        </div>

        <div className={styles.tagsSection}>
          <span className={styles.tagsLabel}>Tags</span>
          <div className={styles.tagsContainer}>
            {formData.tags.map((tag) => (
              <Tag key={tag} size="md" color={getTagColor(tag)} onRemove={() => handleRemoveTag(tag)}>
                {tag}
              </Tag>
            ))}
            <input
              className={styles.tagInput}
              value={tagInput}
              onChange={(e) => { setTagInput(e.target.value); setTagError(''); }}
              onKeyDown={handleTagInputKeyDown}
              placeholder={formData.tags.length === 0 ? 'Type and press Enter' : 'Add more...'}
              aria-label="Add tag"
            />
          </div>
          <div className={styles.tagsHintRow}>
            {tagError ? (
              <span className={styles.tagError}>{tagError}</span>
            ) : tagInput.trim() ? (
              <span className={styles.tagHint}>Press Enter to add</span>
            ) : null}
          </div>
        </div>
      </form>
    </Modal>
  );
}

export { TaskForm };
