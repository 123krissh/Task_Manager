import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Users, CheckSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface Project {
  _id: string;
  name: string;
  description?: string;
  color: string;
  owner: any;
  members: Array<{ user: any; role: string }>;
}

interface ProjectCardProps {
  project: Project;
  taskCount?: number;
  completedCount?: number;
}

export const ProjectCard = ({ project, taskCount = 0, completedCount = 0 }: ProjectCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const ownerId = project.owner?._id || project.owner;
  const isOwner = ownerId === user?.id;

  return (
    <Card
      hover
      onClick={() => navigate(`/projects/${project._id}`)}
      className="relative overflow-hidden"
    >
      <div
        className="absolute top-0 left-0 w-full h-1"
        style={{ backgroundColor: project.color }}
      />
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
          {project.description && (
            <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg ml-4"
          style={{ backgroundColor: project.color }}
        >
          {project.name.charAt(0).toUpperCase()}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>{project.members?.length || 1}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <CheckSquare className="w-4 h-4" />
          <span>{taskCount} tasks</span>
        </div>
        {completedCount > 0 && (
          <Badge variant="success" size="sm">
            {completedCount} done
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {(project.members || []).slice(0, 3).map((member, idx) => (
            <div
              key={member.user?._id || idx}
              className="w-8 h-8 rounded-full border-2 border-white bg-primary flex items-center justify-center text-white text-xs font-medium"
              title={member.user?.name}
            >
              {member.user?.name?.charAt(0).toUpperCase() || '?'}
            </div>
          ))}
          {(project.members?.length || 0) > 3 && (
            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium">
              +{(project.members?.length || 0) - 3}
            </div>
          )}
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400" />
      </div>

      {isOwner && (
        <Badge variant="primary" size="sm" className="absolute top-3 right-3">
          Owner
        </Badge>
      )}
    </Card>
  );
};
