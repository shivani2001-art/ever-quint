import { format, isPast, isToday } from 'date-fns';
import { Pencil, FileText, Zap, User, Tag, Calendar, CalendarDays, Clock3, Inbox, Loader, CircleCheck } from 'lucide-react';
import { getTagColor } from '../../utils/tagColors';
import { Modal } from '../ui/Modal';
import type { Task, TaskStatus } from '../../types/task';
import styles from './TaskDetail.module.css';

const AVATAR_COLORS = ['#e5484d', '#e5770e', '#e5a000', '#30a46c', '#5e6ad2', '#7c66dc', '#ab4aba', '#0d9488'];

const STATUSES: TaskStatus[] = ['Backlog', 'In Progress', 'Done'];

const ACTION_CLASS: Record<TaskStatus, string | undefined> = {
  Backlog: styles.actionBacklog,
  'In Progress': styles.actionInProgress,
  Done: styles.actionDone,
};

const STATUS_ICON: Record<TaskStatus, typeof Inbox> = {
  Backlog: Inbox,
  'In Progress': Loader,
  Done: CircleCheck,
};

const STATUS_CLASS: Record<TaskStatus, string | undefined> = {
  Backlog: styles.statusBacklog,
  'In Progress': styles.statusInProgress,
  Done: styles.statusDone,
};

const PRIORITY_CLASS: Record<string, string | undefined> = {
  High: styles.priorityHigh,
  Medium: styles.priorityMedium,
  Low: styles.priorityLow,
};

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!;
}

interface TaskDetailProps {
  task: Task;
  onEdit: () => void;
  onClose: () => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

function TaskDetail({ task, onEdit, onClose, onStatusChange }: TaskDetailProps) {
  const headerActions = (
    <button type="button" className={styles.editButton} onClick={onEdit}>
      <Pencil size={12} aria-hidden="true" />
      Edit
    </button>
  );

  const isDone = task.status === 'Done';
  const isOverdue = !isDone && !!task.dueDate && isPast(new Date(task.dueDate + 'T23:59:59')) && !isToday(new Date(task.dueDate + 'T00:00:00'));
  const otherStatuses = STATUSES.filter((s) => s !== task.status);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Task Details"
      headerActions={headerActions}
    >
      <div className={styles.body}>
        {/* Title Section */}
        <div className={styles.titleSection}>
          <h3 className={styles.taskTitle}>{task.title}</h3>
          <div className={styles.statusRow}>
            <span className={`${styles.statusBadge} ${STATUS_CLASS[task.status]}`}>
              <span className={styles.statusDot} />
              {task.status}
            </span>
            <span className={`${styles.priorityBadge} ${PRIORITY_CLASS[task.priority] ?? ''}`}>
              {task.priority}
            </span>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Description */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>
            <FileText className={styles.sectionLabelIcon} size={13} aria-hidden="true" />
            <span>Description</span>
          </div>
          {task.description ? (
            <p className={styles.description}>{task.description}</p>
          ) : (
            <p className={`${styles.description} ${styles.descriptionEmpty}`}>
              No description provided.
            </p>
          )}
        </div>

        <div className={styles.divider} />

        {/* Meta Grid */}
        <div className={styles.metaGrid}>
          <div className={styles.metaRow}>
            <User className={styles.metaIcon} size={13} aria-hidden="true" />
            <span className={styles.metaLabel}>Assignee</span>
            <div className={styles.metaValue}>
              {task.assignee ? (
                <>
                  <span
                    className={styles.avatar}
                    style={{ backgroundColor: getAvatarColor(task.assignee) }}
                  >
                    {getInitials(task.assignee)}
                  </span>
                  <span>{task.assignee}</span>
                </>
              ) : (
                <span className={styles.metaEmpty}>Unassigned</span>
              )}
            </div>
          </div>

          <div className={styles.metaRow}>
            <Tag className={styles.metaIcon} size={13} aria-hidden="true" />
            <span className={styles.metaLabel}>Tags</span>
            <div className={styles.metaValue}>
              {task.tags.length > 0 ? (
                task.tags.map((tag) => {
                  const color = getTagColor(tag);
                  return (
                    <span
                      key={tag}
                      className={styles.metaTag}
                      style={{ backgroundColor: `${color}1A`, color }}
                    >
                      {tag}
                    </span>
                  );
                })
              ) : (
                <span className={styles.metaEmpty}>No tags</span>
              )}
            </div>
          </div>

          {task.dueDate && (
            <div className={styles.metaRow}>
              <CalendarDays className={styles.metaIcon} size={13} aria-hidden="true" />
              <span className={styles.metaLabel}>Due</span>
              <span className={`${styles.metaDate} ${isOverdue ? styles.metaOverdue : ''}`}>
                {format(new Date(task.dueDate + 'T00:00:00'), 'MMM d, yyyy')}
                {isOverdue && ' (overdue)'}
              </span>
            </div>
          )}

          <div className={styles.metaRow}>
            <Calendar className={styles.metaIcon} size={13} aria-hidden="true" />
            <span className={styles.metaLabel}>Created</span>
            <span className={styles.metaDate}>
              {format(new Date(task.createdAt), 'MMM d, yyyy')}
            </span>
          </div>

          <div className={styles.metaRow}>
            <Clock3 className={styles.metaIcon} size={13} aria-hidden="true" />
            <span className={styles.metaLabel}>Updated</span>
            <span className={styles.metaDate}>
              {format(new Date(task.updatedAt), 'MMM d, yyyy')}
            </span>
          </div>

          {task.completedAt && (
            <div className={styles.metaRow}>
              <CircleCheck className={`${styles.metaIcon} ${styles.metaCompleted}`} size={13} aria-hidden="true" />
              <span className={styles.metaLabel}>Completed</span>
              <span className={`${styles.metaDate} ${styles.metaCompleted}`}>
                {format(new Date(task.completedAt), 'MMM d, yyyy')}
              </span>
            </div>
          )}
        </div>

        <div className={styles.divider} />

        {/* Quick Actions */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>
            <Zap className={styles.sectionLabelIcon} size={13} aria-hidden="true" />
            <span>Quick Actions</span>
          </div>
          <div className={styles.actionRow}>
            {otherStatuses.map((status) => {
              const StatusIcon = STATUS_ICON[status];
              return (
                <button
                  key={status}
                  type="button"
                  className={`${styles.actionButton} ${ACTION_CLASS[status] ?? ''}`}
                  onClick={() => onStatusChange(task.id, status)}
                >
                  <StatusIcon className={styles.actionIcon} size={12} aria-hidden="true" />
                  {status}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export { TaskDetail };
