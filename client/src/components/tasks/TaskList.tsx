import { useEffect, useState } from 'react';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { Plus, CheckSquare, Loader2 } from 'lucide-react';
import api from '../../services/api';

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  assignee?: { _id: string; name: string; email: string; avatar?: string };
  createdBy?: { _id: string; name: string };
}

interface TaskListProps {
  projectId: string;
  members?: Array<{ user: { _id: string; name: string }; role: string }>;
  isAdmin?: boolean;
}

const statusColumns = [
  { key: 'todo', label: 'To Do', color: 'bg-gray-100' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-blue-50' },
  { key: 'review', label: 'Review', color: 'bg-amber-50' },
  { key: 'completed', label: 'Completed', color: 'bg-green-50' },
];

export const TaskList = ({ projectId, members = [], isAdmin = false }: TaskListProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const response = await api.getProjectTasks(projectId);
      if (response.success) {
        setTasks(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (data: any) => {
    const response = await api.createTask(projectId, data);
    if (response.success) {
      setTasks((prev) => [response.data, ...prev]);
    } else {
      throw new Error(response.message || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (data: any) => {
    if (!editingTask) return;
    const response = await api.updateTask(editingTask._id, data);
    if (response.success) {
      setTasks((prev) => prev.map((t) => (t._id === editingTask._id ? response.data : t)));
      setEditingTask(null);
    } else {
      throw new Error(response.message || 'Failed to update task');
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await api.updateTaskStatus(taskId, newStatus);
      if (response.success) {
        setTasks((prev) => prev.map((t) => (t._id === taskId ? response.data : t)));
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const response = await api.deleteTask(taskId);
      if (response.success) {
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const filteredTasks = filterStatus === 'all'
    ? tasks
    : tasks.filter((t) => t.status === filterStatus);

  const groupedTasks = statusColumns.reduce((acc, col) => {
    acc[col.key] = filteredTasks.filter((t) => t.status === col.key);
    return acc;
  }, {} as Record<string, Task[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
          <Select
            options={[
              { value: 'all', label: 'All Status' },
              ...statusColumns.map((s) => ({ value: s.key, label: s.label })),
            ]}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-card p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <CheckSquare className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks yet</h3>
          <p className="text-gray-500 mb-6">Create your first task to get started.</p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Task
          </Button>
        </div>
      ) : filterStatus !== 'all' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupedTasks[filterStatus].map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onClick={() => setEditingTask(task)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusColumns.map((column) => (
            <div key={column.key} className={`rounded-lg ${column.color} p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-700">{column.label}</h3>
                <span className="text-sm text-gray-500">{groupedTasks[column.key].length}</span>
              </div>
              <div className="space-y-3">
                {groupedTasks[column.key].map((task) => (
                  <div key={task._id} className="bg-white rounded-lg p-3 shadow-sm">
                    <TaskCard
                      task={task}
                      onClick={() => setEditingTask(task)}
                    />
                  </div>
                ))}
                {groupedTasks[column.key].length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No tasks</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTask}
        projectId={projectId}
        members={members}
        mode="create"
      />

      <TaskForm
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSubmit={handleUpdateTask}
        projectId={projectId}
        members={members}
        initialData={editingTask}
        mode="edit"
      />
    </div>
  );
};
