import React from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Container,
} from '@mui/material';
import TaskItem from './TaskItem';

const TaskList = ({ tasks, loading, error, onEditTask, onDeleteTask }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (tasks.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h6" color="text.secondary">
          No tasks found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Add a new task to get started!
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 3 }}>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        ))}
      </Box>
    </Container>
  );
};

export default TaskList;