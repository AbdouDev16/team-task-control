
import React from 'react';
import { Task } from '@/types';
import { Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  compact?: boolean;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, compact = false, onClick }) => {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Non commencé':
        return 'status-not-started';
      case 'En cours':
        return 'status-in-progress';
      case 'Terminé':
        return 'status-completed';
      default:
        return 'status-not-started';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  if (compact) {
    return (
      <div 
        className="p-3 bg-white border rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm truncate">{task.nom}</h3>
          <span className={cn("status-badge", getStatusClass(task.statut))}>
            {task.statut}
          </span>
        </div>
        <div className="text-xs text-muted-foreground flex items-center">
          <Calendar size={12} className="mr-1" />
          <span>{formatDate(task.date_fin)}</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="dashboard-card cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold">{task.nom}</h3>
        <span className={cn("status-badge", getStatusClass(task.statut))}>
          {task.statut}
        </span>
      </div>
      
      {task.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {task.description}
        </p>
      )}
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center">
          <User size={14} className="mr-1" />
          <span>ID: {task.employe_id}</span>
        </div>
        <div className="flex items-center">
          <Calendar size={14} className="mr-1" />
          <span>{formatDate(task.date_debut)} - {formatDate(task.date_fin)}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
