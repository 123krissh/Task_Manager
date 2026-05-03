import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card = ({ children, className, hover = false, onClick }: CardProps) => {
  return (
    <div
      className={clsx(
        'bg-white rounded-lg shadow-card p-6',
        hover && 'cursor-pointer transition-shadow duration-200 hover:shadow-card-hover',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};