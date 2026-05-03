import { Badge, StatusBadge, PriorityBadge } from '../common/Badge';
import { Card } from '../common/Card';
import { Calendar, User } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  assignee?: { _id: string; name: string; email: string; avatar?: string };
  createdBy?: { _id: string; name: string };
  project?: { _id: string; name: string; color: string };
}

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  showProject?: boolean;
}

export const TaskCard = ({ task, onClick, showProject = false }: TaskCardProps) => {
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'completed';

  const statusColors: Record<string, string> = {
    todo: 'border-gray-300',
    in_progress: 'border-blue-500',
    review: 'border-amber-500',
    completed: 'border-green-500',
  };

  return (
    <Card
      hover
      onClick={onClick}
      className={`border-l-4 ${statusColors[task.status] || 'border-gray-300'}`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-gray-900 line-clamp-2">{task.title}</h4>
          <PriorityBadge priority={task.priority} />
        </div>

        {task.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{task.description}</p>
        )}

        <div className="flex items-center gap-4 text-sm">
          <StatusBadge status={task.status} />

          {task.dueDate && (
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
              <Calendar className="w-4 h-4" />
              <span>{isToday(new Date(task.dueDate)) ? 'Today' : format(new Date(task.dueDate), 'MMM d')}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          {task.assignee ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                {task.assignee.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-600">{task.assignee.name}</span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">Unassigned</span>
          )}

          {showProject && task.project && (
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: task.project.color }}
              />
              <span className="text-sm text-gray-600">{task.project.name}</span>
            </div>
          )}
        </div>

        {isOverdue && (
          <Badge variant="danger" className="mt-2">
            Overdue
          </Badge>
        )}
      </div>
    </Card>
  );
};