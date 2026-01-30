import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Material-UI components
jest.mock('@mui/material', () => ({
  ThemeProvider: ({ children }) => <div data-testid="theme-provider">{children}</div>,
  CssBaseline: () => <div data-testid="css-baseline" />,
  AppBar: ({ children }) => <div data-testid="app-bar">{children}</div>,
  Toolbar: ({ children }) => <div data-testid="toolbar">{children}</div>,
  Typography: ({ children }) => <div>{children}</div>,
  Container: ({ children }) => <div data-testid="container">{children}</div>,
  Fab: ({ onClick, children }) => (
    <button data-testid="fab" onClick={onClick} aria-label="Add new task">
      {children}
    </button>
  ),
  Snackbar: ({ open, children }) => open ? <div data-testid="snackbar">{children}</div> : null,
  Alert: ({ children, severity }) => (
    <div data-testid="alert" data-severity={severity}>
      {children}
    </div>
  ),
  Box: ({ children }) => <div data-testid="box">{children}</div>,
}));

jest.mock('@mui/icons-material', () => ({
  Add: () => <span data-testid="add-icon">+</span>,
}));

// Mock our custom components
jest.mock('../components/TaskForm', () => {
  return function MockTaskForm({ open }) {
    return open ? <div data-testid="task-form">Task Form</div> : null;
  };
});

jest.mock('../components/TaskList', () => {
  return function MockTaskList({ tasks, loading, error }) {
    if (loading) return <div data-testid="loading">Loading...</div>;
    if (error) return <div data-testid="error">{error}</div>;
    if (tasks.length === 0) return <div data-testid="empty">No tasks found</div>;
    return (
      <div data-testid="task-list">
        {tasks.map(task => (
          <div key={task.id} data-testid="task-item">{task.name}</div>
        ))}
      </div>
    );
  };
});

jest.mock('../theme', () => ({}));

// Mock fetch
global.fetch = jest.fn();

import App from '../App';

describe('App', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders app structure', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    render(<App />);
    
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
    expect(screen.getByTestId('app-bar')).toBeInTheDocument();
    expect(screen.getByText('Task Manager')).toBeInTheDocument();
    expect(screen.getByText('My Tasks')).toBeInTheDocument();
    expect(screen.getByTestId('fab')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    fetch.mockImplementationOnce(() => 
      new Promise(() => {}) // Never resolves
    );

    render(<App />);
    
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('shows empty state when no tasks', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('empty')).toBeInTheDocument();
    });
  });

  it('shows error state on fetch failure', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('shows tasks when data is loaded', async () => {
    const mockTasks = [
      { id: 1, name: 'Task 1', status: 'pending' },
      { id: 2, name: 'Task 2', status: 'completed' }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTasks
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('task-list')).toBeInTheDocument();
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
  });
});