import { useState } from 'react';
import { Input, Textarea } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import api from '../../services/api';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  projectId: string;
  initialData?: any;
  mode?: 'create' | 'edit';
  members?: Array<{ user: { _id: string; name: string }; role: string }>;
}

export const TaskForm = ({ isOpen, onClose, onSubmit, projectId, initialData, mode = 'create', members = [] }: TaskFormProps) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState(initialData?.status || 'todo');
  const [priority, setPriority] = useState(initialData?.priority || 'medium');
  const [dueDate, setDueDate] = useState(initialData?.dueDate?.split('T')[0] || '');
  const [assignee, setAssignee] = useState(initialData?.assignee?._id || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const taskData: any = {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate: dueDate || null,
        assignee: assignee || null,
      };
      await onSubmit(taskData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'completed', label: 'Completed' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...members.map((m) => ({
      value: m.user._id,
      label: m.user.name,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create New Task' : 'Edit Task'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <Input
          label="Task Title"
          placeholder="Enter task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Textarea
          label="Description"
          placeholder="Enter task description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
          <Select
            label="Priority"
            options={priorityOptions}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            label="Due Date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <Select
            label="Assignee"
            options={assigneeOptions}
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {mode === 'create' ? 'Create Task' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};