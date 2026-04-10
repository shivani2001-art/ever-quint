import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { useTaskStore } from '../features/tasks/store';
import { DEFAULT_FILTERS } from '../types/task';

// Mock window.confirm
beforeEach(() => {
  window.confirm = jest.fn(() => true);
});

// Reset Zustand store before each test
beforeEach(() => {
  useTaskStore.setState({
    tasks: [],
    filters: { ...DEFAULT_FILTERS },
    storageAvailable: true,
    migrationNotice: null,
  });
});

describe('Core workflow', () => {
  test('User can create a task and see it on the board', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Verify empty columns are shown
    expect(screen.getByText(/no tasks in backlog/i)).toBeInTheDocument();

    // Click "New Task" button in the header
    const newTaskButton = screen.getByRole('button', { name: /new task/i });
    await user.click(newTaskButton);

    // Verify modal opens
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const dialog = screen.getByRole('dialog');

    // Fill in title - click first to ensure focus
    const titleInput = within(dialog).getByPlaceholderText(/enter task title/i);
    await user.click(titleInput);
    await user.type(titleInput, 'Fix login bug');

    // Verify title was typed correctly
    expect(titleInput).toHaveValue('Fix login bug');

    // Fill in description
    const descInput = within(dialog).getByPlaceholderText(/describe the task/i);
    await user.click(descInput);
    await user.type(descInput, 'Users cannot log in');

    // Select priority: High - find selects in dialog
    const selects = within(dialog).getAllByRole('combobox');
    const prioritySelect = selects[1]!;
    await user.selectOptions(prioritySelect, 'High');

    // Fill in assignee
    const assigneeInput = within(dialog).getByPlaceholderText(/who is responsible/i);
    await user.click(assigneeInput);
    await user.type(assigneeInput, 'Alice');

    // Click Create Task button
    const submitButton = within(dialog).getByRole('button', { name: /create task/i });
    await user.click(submitButton);

    // Verify board is visible and task card appears
    await waitFor(() => {
      expect(screen.getByText('Fix login bug')).toBeInTheDocument();
    });

    // Verify it's in the Backlog column with priority and assignee
    const backlogColumn = screen.getByRole('region', { name: /backlog column/i });
    expect(within(backlogColumn).getByText('Fix login bug')).toBeInTheDocument();
    expect(within(backlogColumn).getByText('High')).toBeInTheDocument();
    expect(within(backlogColumn).getByTitle('Alice')).toBeInTheDocument();
  });

  test('User can create a task via store and see it on the board', () => {
    // Add a task directly via store
    useTaskStore.getState().addTask({
      title: 'Direct store task',
      description: 'Created via store',
      status: 'Backlog',
      priority: 'High',
      assignee: 'Alice',
      tags: [],
      dueDate: '',
    });

    render(<App />);

    // Task should be visible in the Backlog column
    const backlogColumn = screen.getByRole('region', { name: /backlog column/i });
    expect(within(backlogColumn).getByText('Direct store task')).toBeInTheDocument();
    expect(within(backlogColumn).getByText('High')).toBeInTheDocument();
    expect(within(backlogColumn).getByTitle('Alice')).toBeInTheDocument();
  });

  test('User can move a task between columns via task detail', async () => {
    const user = userEvent.setup();

    // Seed a task directly in the store
    useTaskStore.setState({
      tasks: [
        {
          id: 'move-test-1',
          title: 'Test task to move',
          description: 'A task for testing column moves',
          status: 'Backlog',
          priority: 'Medium',
          assignee: 'Bob',
          tags: [],
          dueDate: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedAt: '',
        },
      ],
    });

    render(<App />);

    // Verify task is in Backlog
    const backlogColumn = screen.getByRole('region', { name: /backlog column/i });
    expect(within(backlogColumn).getByText('Test task to move')).toBeInTheDocument();

    // Click the task card to open TaskDetail modal
    await user.click(within(backlogColumn).getByText('Test task to move'));

    // Wait for the TaskDetail modal to open
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Click the "In Progress" quick action button in the detail modal
    const dialog = screen.getByRole('dialog');
    const inProgressButton = within(dialog).getByRole('button', { name: /in progress/i });
    await user.click(inProgressButton);

    // Verify the card is now in "In Progress" column
    await waitFor(() => {
      const inProgressCol = screen.getByRole('region', { name: /in progress column/i });
      expect(within(inProgressCol).getByText('Test task to move')).toBeInTheDocument();
    });

    // Verify the card is no longer in Backlog
    expect(within(backlogColumn).queryByText('Test task to move')).toBeNull();
  });
});
