import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock Material-UI components
jest.mock('@mui/material', () => ({
  Card: ({ children }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }) => <div data-testid="card-content">{children}</div>,
  Typography: ({ children }) => <div>{children}</div>,
  Chip: ({ label }) => <span data-testid="chip">{label}</span>,
  IconButton: ({ onClick, children, disabled, ...props }) => (
    <button onClick={onClick} disabled={disabled} {...props}>{children}</button>
  ),
  Box: ({ children }) => <div>{children}</div>,
  Tooltip: ({ children }) => <div>{children}</div>,
  Dialog: ({ open, children }) => open ? <div role="dialog">{children}</div> : null,
  DialogTitle: ({ children }) => <h2>{children}</h2>,
  DialogContent: ({ children }) => <div>{children}</div>,
  DialogActions: ({ children }) => <div>{children}</div>,
  TextField: ({ label, value, onChange, disabled, ...props }) => (
    <input
      aria-label={label}
      value={value}
      onChange={onChange}
      disabled={disabled}
      {...props}
    />
  ),
  Button: ({ onClick, children, disabled, type, ...props }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      {...props}
    >
      {children}
    </button>
  ),
  FormControl: ({ children }) => <div>{children}</div>,
  InputLabel: ({ children }) => <label>{children}</label>,
  Select: ({ value, onChange, children, ...props }) => (
    <select value={value} onChange={onChange} {...props}>
      {children}
    </select>
  ),
  MenuItem: ({ value, children }) => <option value={value}>{children}</option>,
  Container: ({ children }) => <div data-testid="container">{children}</div>,
  CircularProgress: () => <div role="progressbar">Loading...</div>,
  Alert: ({ children, severity }) => <div role="alert" data-severity={severity}>{children}</div>,
}));

// Mock Material-UI icons
jest.mock('@mui/icons-material', () => ({
  Edit: () => <span>Edit</span>,
  Delete: () => <span>Delete</span>,
  Event: () => <span>Event</span>,
  Flag: () => <span>Flag</span>,
}));

// Mock date-fns functions
jest.mock('date-fns', () => ({
  format: jest.fn(() => 'Jan 30, 2026 10:00'),
  isPast: jest.fn(() => false),
  isToday: jest.fn(() => false),
}));

// Mock the date picker components
jest.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({ label, value, onChange, slotProps }) => (
    <input
      aria-label={label}
      value={value ? value.toISOString().split('T')[0] : ''}
      onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)}
      type="date"
      {...slotProps?.textField}
    />
  ),
}));

jest.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
  LocalizationProvider: ({ children }) => <div>{children}</div>,
}));

jest.mock('@mui/x-date-pickers/AdapterDateFns', () => ({
  AdapterDateFns: jest.fn(),
}));

// Import components after mocking dependencies
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';
import TaskList from '../components/TaskList';

describe('TaskItem', () => {
  const mockTask = {
    id: 1,
    name: 'Test Task',
    status: 'pending',
    priority: 0,
    due_date: null,
    created_at: '2026-01-30T10:00:00.000Z',
    updated_at: '2026-01-30T10:00:00.000Z'
  };

  const mockProps = {
    task: mockTask,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    loading: false
  };

  beforeEach(() => {
    mockProps.onEdit.mockClear();
    mockProps.onDelete.mockClear();
  });

  it('renders task information correctly', () => {
    render(<TaskItem {...mockProps} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('shows due date when present', () => {
    // Update the format mock to return a simpler test value for due dates  
    const format = require('date-fns').format;
    format.mockReturnValue('Feb 01, 2026');

    const taskWithDueDate = {
      ...mockTask,
      due_date: '2026-02-01T10:00:00.000Z'
    };

    render(<TaskItem {...mockProps} task={taskWithDueDate} />);
    
    // Should have at least 2 chips (status + due date)
    const chips = screen.getAllByTestId('chip');
    expect(chips.length).toBeGreaterThanOrEqual(2);
    
    // Should contain the due date somewhere
    const chipTexts = chips.map(chip => chip.textContent);
    expect(chipTexts).toContain('Feb 01, 2026');
  });

  it('shows priority when greater than 0', () => {
    const highPriorityTask = {
      ...mockTask,
      priority: 2
    };

    render(<TaskItem {...mockProps} task={highPriorityTask} />);
    
    expect(screen.getByText('High Priority')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskItem {...mockProps} />);
    
    const editButton = screen.getByLabelText('Edit task: Test Task');
    await user.click(editButton);
    
    expect(mockProps.onEdit).toHaveBeenCalledWith(mockTask);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskItem {...mockProps} />);
    
    const deleteButton = screen.getByLabelText('Delete task: Test Task');
    await user.click(deleteButton);
    
    expect(mockProps.onDelete).toHaveBeenCalledWith(mockTask.id);
  });

  it('disables buttons when loading', () => {
    render(<TaskItem {...mockProps} loading={true} />);
    
    const editButton = screen.getByLabelText('Edit task: Test Task');
    const deleteButton = screen.getByLabelText('Delete task: Test Task');
    
    expect(editButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });
});

describe('TaskForm', () => {
  const mockProps = {
    open: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    initialTask: null,
    loading: false
  };

  beforeEach(() => {
    mockProps.onClose.mockClear();
    mockProps.onSubmit.mockClear();
  });

  it('renders form fields correctly', () => {
    render(<TaskForm {...mockProps} />);
    
    expect(screen.getByLabelText('Task Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Due date')).toBeInTheDocument();
    expect(screen.getByLabelText('Task status')).toBeInTheDocument();
    expect(screen.getByLabelText('Task priority')).toBeInTheDocument();
  });

  it('shows "Add New Task" title when creating', () => {
    render(<TaskForm {...mockProps} />);
    
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
    expect(screen.getByLabelText('Create task')).toBeInTheDocument();
  });

  it('shows "Edit Task" title when editing', () => {
    const taskToEdit = {
      id: 1,
      name: 'Existing Task',
      status: 'pending',
      priority: 0,
      due_date: null
    };

    render(<TaskForm {...mockProps} initialTask={taskToEdit} />);
    
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByLabelText('Update task')).toBeInTheDocument();
  });

  it('calls onSubmit with form data when submitted', async () => {
    const user = userEvent.setup();
    render(<TaskForm {...mockProps} />);
    
    const nameInput = screen.getByLabelText('Task Name');
    await user.type(nameInput, 'New Task');
    
    const submitButton = screen.getByLabelText('Create task');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockProps.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Task',
          status: 'pending',
          priority: 0
        })
      );
    });
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskForm {...mockProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('disables form when loading', () => {
    render(<TaskForm {...mockProps} loading={true} />);
    
    const nameInput = screen.getByLabelText('Task Name');
    const submitButton = screen.getByText('Saving...');
    
    expect(nameInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });
});

describe('TaskList', () => {
  const mockTasks = [
    {
      id: 1,
      name: 'Task 1',
      status: 'pending',
      priority: 0,
      due_date: null,
      created_at: '2026-01-30T10:00:00.000Z',
      updated_at: '2026-01-30T10:00:00.000Z'
    },
    {
      id: 2,
      name: 'Task 2',
      status: 'completed',
      priority: 1,
      due_date: '2026-02-01T10:00:00.000Z',
      created_at: '2026-01-30T09:00:00.000Z',
      updated_at: '2026-01-30T11:00:00.000Z'
    }
  ];

  const mockProps = {
    tasks: mockTasks,
    loading: false,
    error: null,
    onEditTask: jest.fn(),
    onDeleteTask: jest.fn()
  };

  beforeEach(() => {
    mockProps.onEditTask.mockClear();
    mockProps.onDeleteTask.mockClear();
  });

  it('renders list of tasks', () => {
    render(<TaskList {...mockProps} />);
    
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    render(<TaskList {...mockProps} loading={true} />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error message when error exists', () => {
    render(<TaskList {...mockProps} error="Something went wrong" />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('shows empty state when no tasks', () => {
    render(<TaskList {...mockProps} tasks={[]} />);
    
    expect(screen.getByText('No tasks found')).toBeInTheDocument();
    expect(screen.getByText('Add a new task to get started!')).toBeInTheDocument();
  });

  it('passes edit and delete handlers to task items', () => {
    render(<TaskList {...mockProps} />);
    
    // TaskItem components should receive the handlers
    expect(screen.getAllByLabelText(/Edit task:/)).toHaveLength(2);
    expect(screen.getAllByLabelText(/Delete task:/)).toHaveLength(2);
  });
});