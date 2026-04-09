import { formatDistanceToNow, format, isPast, isToday } from 'date-fns';
import { Draggable } from '@hello-pangea/dnd';
import { CircleCheck, Tag, Clock3, CalendarDays } from 'lucide-react';
import { getTagColor } from '../../utils/tagColors';
import { Card } from '../ui/Card';
import type { Task, TaskStatus } from '../../types/task';
import styles from './TaskCard.module.css';

const PRIORITY_COLORS: Record<string, string> = {
  High: 'var(--color-priority-high)',
  Medium: 'var(--color-priority-medium)',
  Low: 'var(--color-priority-low)',
};

const PRIORITY_BADGE_CLASS: Record<string, string | undefined> = {
  High: styles.priorityHigh,
  Medium: styles.priorityMedium,
  Low: styles.priorityLow,
};

const AVATAR_COLORS = ['#e5484d', '#e5770e', '#e5a000', '#30a46c', '#5e6ad2', '#7c66dc', '#ab4aba', '#0d9488'];

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

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

function TaskCard({ task, index, onEdit }: TaskCardProps) {
  const relativeTime = formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true });
  const isDone = task.status === 'Done';
  const isOverdue = !isDone && !!task.dueDate && isPast(new Date(task.dueDate + 'T23:59:59')) && !isToday(new Date(task.dueDate + 'T00:00:00'));

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={snapshot.isDragging ? styles.dragging : ''}
          {...(index === 0 ? { 'data-onboarding': 'first-card' } : {})}
        >
          <div className={`${styles.cardWrapper} ${isDone ? styles.doneCard : ''}`}>
            <Card as="article" className={styles.card} onClick={() => onEdit(task)}>
              <div className={styles.priorityStripe} style={{ backgroundColor: PRIORITY_COLORS[task.priority] }} />
              <div className={styles.content}>
                {/* Row 1: Title + Priority Badge */}
                <div className={styles.header}>
                  {isDone && (
                    <CircleCheck className={styles.doneIcon} size={14} strokeWidth={2.5} aria-hidden="true" />
                  )}
                  <h3 className={styles.title}>{task.title}</h3>
                  <span className={`${styles.priorityBadge} ${PRIORITY_BADGE_CLASS[task.priority] ?? ''}`}>
                    {task.priority}
                  </span>
                </div>

                {/* Row 2: Description */}
                {task.description && (
                  <p className={styles.description}>{task.description}</p>
                )}

                {/* Row 3: Tags with icon */}
                {task.tags.length > 0 && (
                  <div className={styles.tagsRow}>
                    <Tag className={styles.tagIcon} size={10} aria-hidden="true" />
                    {task.tags.map((tag) => {
                      const color = getTagColor(tag);
                      return (
                        <span
                          key={tag}
                          className={styles.tagPill}
                          style={{ backgroundColor: `${color}1A`, color }}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Row 4: Footer with avatar/name and timestamps */}
                <div className={styles.footer}>
                  <div className={styles.footerLeft}>
                    {task.assignee ? (
                      <>
                        <span
                          className={styles.avatar}
                          style={{ backgroundColor: getAvatarColor(task.assignee) }}
                          title={task.assignee}
                        >
                          {getInitials(task.assignee)}
                        </span>
                        <span className={styles.assigneeName}>{task.assignee}</span>
                      </>
                    ) : (
                      <>
                        <span className={`${styles.avatar} ${styles.avatarEmpty}`}>?</span>
                        <span className={styles.unassigned}>Unassigned</span>
                      </>
                    )}
                  </div>
                  <div className={styles.footerRight}>
                    {isDone && task.completedAt ? (
                      <>
                        <CircleCheck className={styles.completedIcon} size={10} aria-hidden="true" />
                        <span className={styles.time}>{formatDistanceToNow(new Date(task.completedAt), { addSuffix: true })}</span>
                      </>
                    ) : task.dueDate ? (
                      <>
                        <CalendarDays className={isOverdue ? styles.overdueIcon : styles.clockIcon} size={10} aria-hidden="true" />
                        <span className={isOverdue ? styles.overdue : styles.time}>
                          {format(new Date(task.dueDate + 'T00:00:00'), 'MMM d')}
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock3 className={styles.clockIcon} size={10} aria-hidden="true" />
                        <span className={styles.time}>{relativeTime}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </Draggable>
  );
}

export { TaskCard };
