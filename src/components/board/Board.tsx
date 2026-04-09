import { useMemo, useCallback } from 'react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import type { Task, TaskStatus } from '../../types/task';
import { useTaskStore } from '../../features/tasks/store';
import { Column } from './Column';
import styles from './Board.module.css';

const STATUSES: TaskStatus[] = ['Backlog', 'In Progress', 'Done'];

interface BoardProps {
  onEditTask: (task: Task) => void;
}

function Board({ onEditTask }: BoardProps) {
  const getFilteredAndSortedTasks = useTaskStore((state) => state.getFilteredAndSortedTasks);
  const moveTask = useTaskStore((state) => state.moveTask);
  const tasks = useTaskStore((state) => state.tasks);
  const filters = useTaskStore((state) => state.filters);

  const tasksByStatus = useMemo(() => {
    const filtered = getFilteredAndSortedTasks();
    const grouped: Record<TaskStatus, Task[]> = {
      Backlog: [],
      'In Progress': [],
      Done: [],
    };
    for (const task of filtered) {
      grouped[task.status].push(task);
    }
    return grouped;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, filters, getFilteredAndSortedTasks]);

  const handleStatusChange = (id: string, status: TaskStatus) => {
    moveTask(id, status);
  };

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { draggableId, destination } = result;
      if (!destination) return;
      const newStatus = destination.droppableId as TaskStatus;
      moveTask(draggableId, newStatus);
    },
    [moveTask],
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className={styles.board} role="region" aria-label="Task board" data-onboarding="board">
        {STATUSES.map((status, index) => (
          <Column
            key={status}
            status={status}
            index={index}
            tasks={tasksByStatus[status]}
            onEditTask={onEditTask}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </DragDropContext>
  );
}

export { Board };
