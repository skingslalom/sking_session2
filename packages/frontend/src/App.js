import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Fab,
  Snackbar,
  Alert,
  Box,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import theme from './theme';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/items');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setTasks(result);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks: ' + err.message);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      setSubmitting(true);
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const newTask = await response.json();
      setTasks(prevTasks => [...prevTasks, newTask]);
      setTaskFormOpen(false);
      setSnackbar({ open: true, message: 'Task created successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Error creating task: ' + err.message, severity: 'error' });
      console.error('Error creating task:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      setSubmitting(true);
      const response = await fetch(`/api/items/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task)
      );
      setTaskFormOpen(false);
      setEditingTask(null);
      setSnackbar({ open: true, message: 'Task updated successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Error updating task: ' + err.message, severity: 'error' });
      console.error('Error updating task:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await fetch(`/api/items/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      setSnackbar({ open: true, message: 'Task deleted successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Error deleting task: ' + err.message, severity: 'error' });
      console.error('Error deleting task:', err);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  };

  const handleFormSubmit = (taskData) => {
    if (editingTask) {
      handleUpdateTask(taskData);
    } else {
      handleCreateTask(taskData);
    }
  };

  const handleCloseTaskForm = () => {
    setTaskFormOpen(false);
    setEditingTask(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" elevation={2}>
          <Toolbar>
            <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
              Task Manager
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom textAlign="center">
            My Tasks
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
            Organize and track your daily tasks
          </Typography>

          <TaskList
            tasks={tasks}
            loading={loading}
            error={error}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />

          <Fab
            color="primary"
            aria-label="Add new task"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
            }}
            onClick={() => setTaskFormOpen(true)}
          >
            <AddIcon />
          </Fab>

          <TaskForm
            open={taskFormOpen}
            onClose={handleCloseTaskForm}
            onSubmit={handleFormSubmit}
            initialTask={editingTask}
            loading={submitting}
          />

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
          >
            <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;