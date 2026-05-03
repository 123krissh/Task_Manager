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
  { key: 'todo', label: 'To Do', color: 'bg-gray-50 border-gray-200' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-blue-50 border-blue-200' },
  { key: 'review', label: 'Review', color: 'bg-amber-50 border-amber-200' },
  { key: 'completed', label: 'Completed', color: 'bg-green-50 border-green-200' },
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
      if (response.success) setTasks(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (data: any) => {
    const res = await api.createTask(projectId, data);
    if (res.success) setTasks((prev) => [res.data, ...prev]);
  };

  const handleUpdateTask = async (data: any) => {
    if (!editingTask) return;
    const res = await api.updateTask(editingTask._id, data);
    if (res.success) {
      setTasks((prev) => prev.map((t) => (t._id === editingTask._id ? res.data : t)));
      setEditingTask(null);
    }
  };

  const filteredTasks =
    filterStatus === 'all'
      ? tasks
      : tasks.filter((t) => t.status === filterStatus);

  const groupedTasks = statusColumns.reduce((acc, col) => {
    acc[col.key] = filteredTasks.filter((t) => t.status === col.key);
    return acc;
  }, {} as Record<string, Task[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6">

      {/* TOP TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/70 backdrop-blur-md border border-gray-200 rounded-xl px-5 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
            Tasks
          </h2>

          <Select
            options={[
              { value: 'all', label: 'All' },
              ...statusColumns.map((s) => ({ value: s.key, label: s.label })),
            ]}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          />
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="w-4 h-4" />
          New Task
        </Button>
      </div>

      {/* EMPTY STATE */}
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 bg-white border rounded-xl shadow-sm">
          <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-6">
            <CheckSquare className="w-10 h-10 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            No tasks yet
          </h3>
          <p className="text-gray-500 mb-6 text-center max-w-sm">
            Start managing your project by creating your first task.
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
        </div>
      ) : filterStatus !== 'all' ? (

        // FILTERED GRID VIEW 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupedTasks[filterStatus].map((task) => (
            <div
              key={task._id}
              className="transition hover:scale-[1.02]"
            >
              <TaskCard task={task} onClick={() => setEditingTask(task)} />
            </div>
          ))}
        </div>

      ) : (

        // KANBAN BOARD 
        <div className="flex gap-4 overflow-x-auto pb-2">

          {statusColumns.map((column) => (
            <div
              key={column.key}
              className={`min-w-[300px] flex flex-col rounded-xl border ${column.color} shadow-sm`}
            >

              {/* COLUMN HEADER */}
              <div className="sticky top-0 z-10 backdrop-blur bg-white/90 px-4 py-3 border-b flex items-center justify-between">
                <h3 className="font-medium text-gray-700">
                  {column.label}
                </h3>
                <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                  {groupedTasks[column.key].length}
                </span>
              </div>

              {/* TASK LIST */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[70vh]">
                {groupedTasks[column.key].map((task) => (
                  <div
                    key={task._id}
                    className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition"
                  >
                    <TaskCard
                      task={task}
                      onClick={() => setEditingTask(task)}
                    />
                  </div>
                ))}

                {groupedTasks[column.key].length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6">
                    No tasks
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALS */}
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

