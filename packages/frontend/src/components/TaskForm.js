import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const TaskForm = ({
  open,
  onClose,
  onSubmit,
  initialTask = null,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: initialTask?.name || '',
    due_date: initialTask?.due_date ? new Date(initialTask.due_date) : null,
    status: initialTask?.status || 'pending',
    priority: initialTask?.priority || 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const taskData = {
      ...formData,
      due_date: formData.due_date ? formData.due_date.toISOString() : null,
    };

    onSubmit(taskData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      // Reset form data
      setFormData({
        name: '',
        due_date: null,
        status: 'pending',
        priority: 0,
      });
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      aria-labelledby="task-form-dialog-title"
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle id="task-form-dialog-title">
          {initialTask ? 'Edit Task' : 'Add New Task'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              autoFocus
              required
              fullWidth
              label="Task Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={loading}
              inputProps={{ 'aria-label': 'Task name' }}
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Due Date (Optional)"
                value={formData.due_date}
                onChange={(date) => handleChange('due_date', date)}
                disabled={loading}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    'aria-label': 'Due date',
                  },
                }}
              />
            </LocalizationProvider>

            <FormControl fullWidth disabled={loading}>
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                value={formData.status}
                label="Status"
                onChange={(e) => handleChange('status', e.target.value)}
                aria-label="Task status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={loading}>
              <InputLabel id="priority-select-label">Priority</InputLabel>
              <Select
                labelId="priority-select-label"
                value={formData.priority}
                label="Priority"
                onChange={(e) => handleChange('priority', e.target.value)}
                aria-label="Task priority"
              >
                <MenuItem value={0}>Low</MenuItem>
                <MenuItem value={1}>Medium</MenuItem>
                <MenuItem value={2}>High</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleClose} 
            disabled={loading}
            aria-label="Cancel task form"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formData.name.trim()}
            aria-label={initialTask ? 'Update task' : 'Create task'}
          >
            {loading ? 'Saving...' : (initialTask ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskForm;