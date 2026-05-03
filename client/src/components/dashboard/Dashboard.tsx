import { AlertTriangle, CheckCircle2, Clock, FolderKanban, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { StatsCard } from './StatsCard';
import api from '../../services/api';

interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  tasksByStatus: {
    todo: number;
    in_progress: number;
    review: number;
    completed: number;
  };
  overdueTasks: number;
  highPriorityTasks: number;
  recentProjects: Array<{
    _id: string;
    name: string;
    color: string;
    memberCount?: number;
    createdAt: string;
  }>;
  dueSoon: Array<{
    _id: string;
    title: string;
    dueDate?: string;
    priority: string;
  }>;
}

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.getDashboardStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const dashboardStats = stats ?? {
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-500 mt-1">
          Here's what's happening with your projects today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCardWithData
          title="Total Projects"
          value={dashboardStats.totalProjects}
          color="primary"
          icon={<FolderKanban className="w-6 h-6" />}
        />
        <StatsCardWithData
          title="Total Tasks"
          value={dashboardStats.totalTasks}
          color="info"
          icon={<Clock className="w-6 h-6" />}
        />
        <StatsCardWithData
          title="Completed"
          value={dashboardStats.tasksByStatus.completed}
          color="success"
          icon={<CheckCircle2 className="w-6 h-6" />}
        />
        <StatsCardWithData
          title="Overdue"
          value={dashboardStats.overdueTasks}
          color="warning"
          icon={<AlertTriangle className="w-6 h-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
            <button
              onClick={() => navigate('/projects')}
              className="text-sm text-primary hover:underline"
            >
              View all
            </button>
          </div>
          {loading ? (
            <p className="text-sm text-gray-500">Loading recent projects...</p>
          ) : dashboardStats.recentProjects.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <FolderKanban className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">No projects yet</p>
              <button
                onClick={() => navigate('/projects')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create your first project
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboardStats.recentProjects.map((project) => (
                <div
                  key={project._id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/projects/${project._id}`)}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: project.color }}
                  >
                    {project.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{project.name}</p>
                    <p className="text-sm text-gray-500">
                      {project.memberCount ?? 1} members
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/projects')}
              className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary hover:bg-primary-50 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-gray-700">New Project</span>
            </button>
            <button
              onClick={() => navigate('/projects')}
              className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-dashed border-gray-200 hover:border-secondary hover:bg-green-50 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <FolderKanban className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">View Tasks</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatsCardWithData = ({ title, value, icon, color }: any) => {
  return <StatsCard title={title} value={value} icon={icon} color={color} />;
};
