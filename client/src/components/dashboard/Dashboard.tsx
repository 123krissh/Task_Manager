import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FolderKanban,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { StatsCard } from './StatsCard';
import api from '../../services/api';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.getDashboardStats();
        if (res.success) setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const data = stats ?? {
    totalProjects: 0,
    totalTasks: 0,
    tasksByStatus: { todo: 0, in_progress: 0, review: 0, completed: 0 },
    overdueTasks: 0,
    highPriorityTasks: 0,
    recentProjects: [],
    dueSoon: [],
  };

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            👋 Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-gray-500 mt-1">
            Here's what's happening today.
          </p>
        </div>

        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Projects" value={data.totalProjects} icon={<FolderKanban />} color="primary" />
        <StatsCard title="Tasks" value={data.totalTasks} icon={<Clock />} color="info" />
        <StatsCard title="Completed" value={data.tasksByStatus.completed} icon={<CheckCircle2 />} color="success" />
        <StatsCard title="Overdue" value={data.overdueTasks} icon={<AlertTriangle />} color="warning" />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* RECENT PROJECTS */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur rounded-xl border p-6 shadow-sm">

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Projects
            </h2>
            <button
              onClick={() => navigate('/projects')}
              className="text-sm flex items-center gap-1 text-indigo-600 hover:underline"
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : data.recentProjects.length === 0 ? (
            <EmptyState navigate={navigate} />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {data.recentProjects.map((p: any) => (
                <div
                  key={p._id}
                  onClick={() => navigate(`/projects/${p._id}`)}
                  className="group p-4 rounded-xl border hover:shadow-md hover:-translate-y-1 transition cursor-pointer bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: p.color }}
                    >
                      {p.name.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {p.memberCount ?? 1} members
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SIDE PANEL */}
        <div className="space-y-6">

          {/* QUICK ACTIONS */}
          <div className="bg-white/70 backdrop-blur rounded-xl border p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>

            <div className="space-y-3">
              <ActionCard
                label="Create Project"
                icon={<Plus />}
                onClick={() => navigate('/projects')}
              />
              <ActionCard
                label="View Tasks"
                icon={<FolderKanban />}
                onClick={() => navigate('/projects')}
              />
            </div>
          </div>

          {/* DUE SOON */}
          <div className="bg-white/70 backdrop-blur rounded-xl border p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Due Soon
            </h2>

            {data.dueSoon.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming deadlines 🎉</p>
            ) : (
              <div className="space-y-3">
                {data.dueSoon.map((task: any) => (
                  <div
                    key={task._id}
                    className="p-3 rounded-lg border bg-gray-50"
                  >
                    <p className="text-sm font-medium text-gray-800">
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

const ActionCard = ({ label, icon, onClick }: any) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 w-full p-3 rounded-lg border hover:bg-indigo-50 hover:border-indigo-300 transition"
  >
    <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
      {icon}
    </div>
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </button>
);

const EmptyState = ({ navigate }: any) => (
  <div className="text-center py-10">
    <FolderKanban className="w-10 h-10 text-gray-400 mx-auto mb-3" />
    <p className="text-gray-500 mb-4">No projects yet</p>
    <button
      onClick={() => navigate('/projects')}
      className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
    >
      Create Project
    </button>
  </div>
);