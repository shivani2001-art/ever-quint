import { Droppable } from '@hello-pangea/dnd';
import { Inbox, Loader, CircleCheck } from 'lucide-react';
import type { Task, TaskStatus } from '../../types/task';
import { TaskCard } from './TaskCard';
import styles from './Column.module.css';

const STATUS_ACCENT: Record<TaskStatus, string> = {
  Backlog: 'transparent',
  'In Progress': 'transparent',
  Done: 'transparent',
};

const STATUS_COLOR: Record<TaskStatus, string> = {
  Backlog: '#71717A',
  'In Progress': '#3B82F6',
  Done: '#22C55E',
};

const COUNT_STYLES: Record<TaskStatus, { bg: string; color: string }> = {
  Backlog: { bg: '#71717A1A', color: '#71717A' },
  'In Progress': { bg: '#3B82F61A', color: '#3B82F6' },
  Done: { bg: '#22C55E1A', color: '#22C55E' },
};

const STATUS_ICON: Record<TaskStatus, typeof Inbox> = {
  Backlog: Inbox,
  'In Progress': Loader,
  Done: CircleCheck,
};

interface ColumnProps {
  status: TaskStatus;
  index: number;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

function Column({ status, index, tasks, onEditTask, onStatusChange }: ColumnProps) {
  const IconComponent = STATUS_ICON[status];
  const iconColor = STATUS_COLOR[status];
  const countStyle = COUNT_STYLES[status];

  return (
    <Droppable droppableId={status}>
      {(provided, snapshot) => (
        <section
          className={styles.column}
          aria-label={`${status} column`}
          {...(index === 0 ? { 'data-onboarding': 'first-column' } : {})}
          style={{
            '--column-accent': STATUS_ACCENT[status],
            '--column-title-color': iconColor,
            '--count-bg': countStyle.bg,
            '--count-color': countStyle.color,
          } as React.CSSProperties}
        >
          <div className={styles.header}>
            <IconComponent className={styles.columnIcon} size={13} color={iconColor} aria-hidden="true" />
            <h2 className={styles.title}>{status}</h2>
            <span className={styles.count} aria-label={`${tasks.length} tasks`}>
              {tasks.length}
            </span>
          </div>
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`${styles.taskList} ${snapshot.isDraggingOver ? styles.taskListActive : ''}`}
          >
            {tasks.length === 0 ? (
              <p className={styles.empty}>No tasks in {status}</p>
            ) : (
              tasks.map((task, taskIndex) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={taskIndex}
                  onEdit={onEditTask}
                  onStatusChange={onStatusChange}
                />
              ))
            )}
            {provided.placeholder}
          </div>
        </section>
      )}
    </Droppable>
  );
}

export { Column };
