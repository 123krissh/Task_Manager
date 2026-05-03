import { StatusBadge, PriorityBadge } from '../common/Badge';
import { Calendar } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  assignee?: { _id: string; name: string; email: string; avatar?: string };
  project?: { _id: string; name: string; color: string };
}

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  showProject?: boolean;
}

export const TaskCard = ({
  task,
  onClick,
  showProject = false,
}: TaskCardProps) => {
  const isOverdue =
    task.dueDate &&
    isPast(new Date(task.dueDate)) &&
    task.status !== 'completed';

  const statusBorder: Record<string, string> = {
    todo: 'border-gray-300',
    in_progress: 'border-blue-500',
    review: 'border-amber-500',
    completed: 'border-green-500',
  };

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer rounded-xl border ${statusBorder[task.status]} bg-white p-4 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition`}
    >
      <div className="flex flex-col gap-3">

        {/* HEADER */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition">
            {task.title}
          </h4>

          <PriorityBadge priority={task.priority} />
        </div>

        {/* DESCRIPTION */}
        {task.description && (
          <p className="text-xs text-gray-500 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* META ROW */}
        <div className="flex items-center justify-between text-xs">

          {/* LEFT */}
          <div className="flex items-center gap-2">
            <StatusBadge status={task.status} />

            {task.dueDate && (
              <div
                className={`flex items-center gap-1 ${
                  isOverdue ? 'text-red-500' : 'text-gray-500'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {isToday(new Date(task.dueDate))
                    ? 'Today'
                    : format(new Date(task.dueDate), 'MMM d')}
                </span>
              </div>
            )}
          </div>

          {/* RIGHT (ASSIGNEE AVATAR ONLY) */}
          {task.assignee ? (
            <div
              title={task.assignee.name}
              className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[11px] font-semibold"
            >
              {task.assignee.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div className="text-gray-300 text-[11px]">—</div>
          )}
        </div>

        {/* PROJECT TAG */}
        {showProject && task.project && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: task.project.color }}
            />
            <span className="truncate">{task.project.name}</span>
          </div>
        )}

        {/* OVERDUE */}
        {isOverdue && (
          <div className="text-[10px] font-medium text-red-500">
            Overdue
          </div>
        )}
      </div>
    </div>
  );
};