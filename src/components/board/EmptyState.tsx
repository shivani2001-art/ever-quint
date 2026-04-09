import { Button } from '../ui/Button';
import styles from './EmptyState.module.css';

type EmptyStateType = 'no-tasks' | 'no-matches' | 'storage-unavailable';

interface EmptyStateProps {
  type: EmptyStateType;
  onCreateTask?: () => void;
}

function InboxIcon() {
  return (
    <svg className={styles.icon} width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
      <path d="M24 18v12M18 24h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className={styles.icon} width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="22" cy="22" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M29.5 29.5L36 36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 18l8 8M26 18l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className={styles.icon} width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M24 10L40 38H8L24 10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M24 22v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="24" cy="34" r="1" fill="currentColor" />
    </svg>
  );
}

const CONTENT: Record<EmptyStateType, { heading: string; text: string; Icon: React.FC }> = {
  'no-tasks': {
    heading: 'No tasks yet',
    text: 'Create your first task to get started.',
    Icon: InboxIcon,
  },
  'no-matches': {
    heading: 'No matching tasks',
    text: 'Try adjusting your filters.',
    Icon: SearchIcon,
  },
  'storage-unavailable': {
    heading: 'Storage unavailable',
    text: "Your changes won't be saved between sessions.",
    Icon: WarningIcon,
  },
};

function EmptyState({ type, onCreateTask }: EmptyStateProps) {
  const { heading, text, Icon } = CONTENT[type];

  return (
    <div
      className={`${styles.container} ${type === 'storage-unavailable' ? styles.warning : ''}`}
      role="status"
    >
      <Icon />
      <h2 className={styles.heading}>{heading}</h2>
      <p className={styles.text}>{text}</p>
      {type === 'no-tasks' && onCreateTask && (
        <Button onClick={onCreateTask} size="sm">Create Task</Button>
      )}
    </div>
  );
}

export { EmptyState };
export type { EmptyStateProps };
