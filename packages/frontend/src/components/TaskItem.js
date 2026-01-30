import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Box,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import { format, isPast, isToday } from 'date-fns';

const TaskItem = ({ task, onEdit, onDelete, loading = false }) => {
  const getDueDateColor = (dueDate) => {
    if (!dueDate) return 'default';
    const date = new Date(dueDate);
    if (isPast(date) && !isToday(date)) return 'error';
    if (isToday(date)) return 'warning';
    return 'info';
  };

  const getDueDateText = (dueDate) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    if (isToday(date)) return 'Due Today';
    if (isPast(date)) return `Overdue (${format(date, 'MMM dd')})`;
    return format(date, 'MMM dd, yyyy');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 2:
        return 'error';
      case 1:
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 2:
        return 'High';
      case 1:
        return 'Medium';
      default:
        return 'Low';
    }
  };

  const dueDateText = getDueDateText(task.due_date);
  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));

  return (
    <Card 
      sx={{ 
        mb: 2, 
        opacity: task.status === 'completed' ? 0.7 : 1,
        border: isOverdue ? '2px solid' : '1px solid',
        borderColor: isOverdue ? 'error.main' : 'divider',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography 
            variant="h6" 
            component="h3"
            sx={{ 
              flexGrow: 1, 
              textDecoration: task.status === 'completed' ? 'line-through' : 'none',
              mr: 2,
            }}
          >
            {task.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Edit task">
              <IconButton
                onClick={() => onEdit(task)}
                disabled={loading}
                size="small"
                aria-label={`Edit task: ${task.name}`}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete task">
              <IconButton
                onClick={() => onDelete(task.id)}
                disabled={loading}
                size="small"
                color="error"
                aria-label={`Delete task: ${task.name}`}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <Chip
            label={task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
            color={getStatusColor(task.status)}
            size="small"
          />
          
          {task.priority > 0 && (
            <Chip
              icon={<FlagIcon />}
              label={`${getPriorityText(task.priority)} Priority`}
              color={getPriorityColor(task.priority)}
              size="small"
            />
          )}

          {dueDateText && (
            <Chip
              icon={<EventIcon />}
              label={dueDateText}
              color={getDueDateColor(task.due_date)}
              size="small"
            />
          )}
        </Box>

        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ display: 'block', mt: 1 }}
        >
          Created: {format(new Date(task.created_at), 'MMM dd, yyyy HH:mm')}
          {task.updated_at && task.updated_at !== task.created_at && (
            <span> • Updated: {format(new Date(task.updated_at), 'MMM dd, yyyy HH:mm')}</span>
          )}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default TaskItem;