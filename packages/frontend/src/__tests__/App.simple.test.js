import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the Material-UI components to avoid complex dependencies
jest.mock('@mui/material', () => ({
  ThemeProvider: ({ children }) => <div data-testid="theme-provider">{children}</div>,
  CssBaseline: () => <div data-testid="css-baseline" />,
  AppBar: ({ children, ...props }) => <div data-testid="app-bar" {...props}>{children}</div>,
  Toolbar: ({ children }) => <div data-testid="toolbar">{children}</div>,
  Typography: ({ children, ...props }) => <div {...props}>{children}</div>,
  Container: ({ children, ...props }) => <div data-testid="container" {...props}>{children}</div>,
  Fab: ({ children, onClick, ...props }) => (
    <button data-testid="fab" onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Snackbar: ({ children, open }) => open ? <div data-testid="snackbar">{children}</div> : null,
  Alert: ({ children, onClose, severity }) => (
    <div data-testid="alert" data-severity={severity}>
      {children}
      {onClose && <button onClick={onClose}>Close</button>}
    </div>
  ),
  Box: ({ children, ...props }) => <div data-testid="box" {...props}>{children}</div>,
}));

// Mock Material-UI icons
jest.mock('@mui/icons-material', () => ({
  Add: () => <span data-testid="add-icon">+</span>,
}));

// Mock our custom components
jest.mock('../components/TaskForm', () => {
  return function MockTaskForm() {
    return <div data-testid="task-form">Task Form</div>;
  };
});

jest.mock('../components/TaskList', () => {
  return function MockTaskList({ tasks, loading, error }) {
    if (loading) return <div data-testid="loading">Loading...</div>;
    if (error) return <div data-testid="error">{error}</div>;
    return (
      <div data-testid="task-list">
        {tasks.map(task => (
          <div key={task.id} data-testid="task-item">{task.name}</div>
        ))}
      </div>
    );
  };
});

// Mock theme
jest.mock('../theme', () => ({
  default: {}
}));

// Mock fetch
global.fetch = jest.fn();

describe('App Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders basic app structure', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    const { default: App } = await import('../App');
    render(<App />);
    
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
    expect(screen.getByTestId('app-bar')).toBeInTheDocument();
    expect(screen.getByText('Task Manager')).toBeInTheDocument();
    expect(screen.getByText('My Tasks')).toBeInTheDocument();
    expect(screen.getByTestId('fab')).toBeInTheDocument();
  });

  it('renders loading state initially', async () => {
    fetch.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => []
      }), 1000))
    );

    const { default: App } = await import('../App');
    render(<App />);
    
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders error state on fetch failure', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    fetch.mockRejectedValueOnce(new Error('Network error'));

    const { default: App } = await import('../App');
    render(<App />);

    // Wait for error to appear
    await screen.findByTestId('error');
    
    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.getByText(/Failed to fetch tasks/)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});