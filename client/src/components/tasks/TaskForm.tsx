import { useState, useEffect } from 'react';
import { Input, Textarea } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  projectId: string;
  initialData?: any;
  mode?: 'create' | 'edit';
  members?: Array<{ user: { _id: string; name: string }; role: string }>;
}

export const TaskForm = ({
  isOpen,
  onClose,
  onSubmit,
  projectId,
  initialData,
  mode = 'create',
  members = [],
}: TaskFormProps) => {

  // CENTRALIZED FORM STATE
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    assignee: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // FIX: SYNC STATE WITH initialData
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setForm({
          title: initialData.title || '',
          description: initialData.description || '',
          status: initialData.status || 'todo',
          priority: initialData.priority || 'medium',
          dueDate: initialData.dueDate?.split('T')[0] || '',
          assignee: initialData.assignee?._id || '',
        });
      } else {
        // RESET FORM FOR CREATE MODE
        setForm({
          title: '',
          description: '',
          status: 'todo',
          priority: 'medium',
          dueDate: '',
          assignee: '',
        });
      }

      setError('');
    }
  }, [initialData, mode, isOpen]);

  // HANDLE INPUT CHANGE (GENERIC)
  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError('Task title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const taskData = {
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
        priority: form.priority,
        dueDate: form.dueDate || null,
        assignee: form.assignee || null,
      };

      await onSubmit(taskData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  // OPTIONS
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

        {/* TITLE */}
        <Input
          label="Task Title"
          placeholder="Enter task title"
          value={form.title}
          onChange={(e) => handleChange('title', e.target.value)}
          required
        />

        {/* DESCRIPTION */}
        <Textarea
          label="Description"
          placeholder="Enter task description"
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
        />

        {/* STATUS + PRIORITY */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            options={statusOptions}
            value={form.status}
            onChange={(e) => handleChange('status', e.target.value)}
          />
          <Select
            label="Priority"
            options={priorityOptions}
            value={form.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
          />
        </div>

        {/* DATE + ASSIGNEE */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            label="Due Date"
            value={form.dueDate}
            onChange={(e) => handleChange('dueDate', e.target.value)}
          />
          <Select
            label="Assignee"
            options={assigneeOptions}
            value={form.assignee}
            onChange={(e) => handleChange('assignee', e.target.value)}
          />
        </div>

        {/* ACTIONS */}
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