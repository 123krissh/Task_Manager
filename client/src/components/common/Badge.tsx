import { clsx } from 'clsx';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

export const Badge = ({ children, variant = 'default', size = 'md', className }: BadgeProps) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
    todo: { label: 'To Do', variant: 'default' },
    in_progress: { label: 'In Progress', variant: 'info' },
    review: { label: 'Review', variant: 'warning' },
    completed: { label: 'Completed', variant: 'success' },
  };

  const config = statusConfig[status] || { label: status, variant: 'default' };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const PriorityBadge = ({ priority }: { priority: string }) => {
  const priorityConfig: Record<string, { label: string; variant: BadgeVariant }> = {
    low: { label: 'Low', variant: 'default' },
    medium: { label: 'Medium', variant: 'info' },
    high: { label: 'High', variant: 'warning' },
    urgent: { label: 'Urgent', variant: 'danger' },
  };

  const config = priorityConfig[priority] || { label: priority, variant: 'default' };

  return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
};