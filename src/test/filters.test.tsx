import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { useTaskStore } from '../features/tasks/store';
import { DEFAULT_FILTERS } from '../types/task';
import type { Task } from '../types/task';

function createTask(overrides: Partial<Task> & { id: string; title: string }): Task {
  const now = new Date().toISOString();
  return {
    description: '',
    status: 'Backlog',
    priority: 'Medium',
    assignee: '',
    tags: [],
    dueDate: '',
    createdAt: now,
    updatedAt: now,
    completedAt: '',
    ...overrides,
  };
}

// Mock window.confirm
beforeEach(() => {
  window.confirm = jest.fn(() => true);
});

// Reset store before each test
beforeEach(() => {
  useTaskStore.setState({
    tasks: [],
    filters: { ...DEFAULT_FILTERS },
    storageAvailable: true,
    migrationNotice: null,
  });
});

describe('Filtering', () => {
  test('Filtering by status hides tasks in unchecked columns', async () => {
    const user = userEvent.setup();

    useTaskStore.setState({
      tasks: [
        createTask({ id: '1', title: 'Backlog task', status: 'Backlog' }),
        createTask({ id: '2', title: 'Progress task', status: 'In Progress' }),
        createTask({ id: '3', title: 'Done task', status: 'Done' }),
      ],
    });

    render(<App />);

    // All three tasks visible
    expect(screen.getByText('Backlog task')).toBeInTheDocument();
    expect(screen.getByText('Progress task')).toBeInTheDocument();
    expect(screen.getByText('Done task')).toBeInTheDocument();

    // Open the Status dropdown and uncheck "Done"
    const statusButton = screen.getByRole('button', { name: /status/i });
    await user.click(statusButton);

    const doneCheckbox = screen.getByRole('checkbox', { name: /^Done$/i });
    await user.click(doneCheckbox);

    // Done task should be hidden, others visible
    await waitFor(() => {
      expect(screen.queryByText('Done task')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Backlog task')).toBeInTheDocument();
    expect(screen.getByText('Progress task')).toBeInTheDocument();
  });

  test('Text search filters tasks by title', async () => {
    jest.useFakeTimers({ advanceTimers: true });
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    useTaskStore.setState({
      tasks: [
        createTask({ id: '1', title: 'Fix login bug', status: 'Backlog' }),
        createTask({ id: '2', title: 'Add signup page', status: 'In Progress' }),
        createTask({ id: '3', title: 'Update docs', status: 'Done' }),
      ],
    });

    render(<App />);

    // All visible
    expect(screen.getByText('Fix login bug')).toBeInTheDocument();
    expect(screen.getByText('Add signup page')).toBeInTheDocument();
    expect(screen.getByText('Update docs')).toBeInTheDocument();

    // Type in search
    const searchInput = screen.getByRole('textbox', { name: /search/i });
    await user.type(searchInput, 'login');

    // Advance past the 300ms debounce
    act(() => {
      jest.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(screen.getByText('Fix login bug')).toBeInTheDocument();
      expect(screen.queryByText('Add signup page')).not.toBeInTheDocument();
      expect(screen.queryByText('Update docs')).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  test('Priority filter shows only matching tasks', async () => {
    const user = userEvent.setup();

    useTaskStore.setState({
      tasks: [
        createTask({ id: '1', title: 'Urgent fix', status: 'Backlog', priority: 'High' }),
        createTask({ id: '2', title: 'Nice to have', status: 'Backlog', priority: 'Low' }),
        createTask({ id: '3', title: 'Normal work', status: 'In Progress', priority: 'Medium' }),
      ],
    });

    render(<App />);

    // All visible
    expect(screen.getByText('Urgent fix')).toBeInTheDocument();
    expect(screen.getByText('Nice to have')).toBeInTheDocument();
    expect(screen.getByText('Normal work')).toBeInTheDocument();

    // Find the priority filter select by its aria-label
    const prioritySelect = screen.getByRole('combobox', { name: /filter by priority/i });
    expect(prioritySelect).toBeTruthy();

    await user.selectOptions(prioritySelect, 'High');

    // Only High priority task visible
    await waitFor(() => {
      expect(screen.getByText('Urgent fix')).toBeInTheDocument();
      expect(screen.queryByText('Nice to have')).not.toBeInTheDocument();
      expect(screen.queryByText('Normal work')).not.toBeInTheDocument();
    });
  });
});
