
import React from 'react';
import { Project } from '@/types';
import { Calendar, User } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProjectCardProps {
  project: Project;
  progress: number;
  onClick?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, progress, onClick }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const getProgressColor = (value: number) => {
    if (value < 30) return 'bg-project-red';
    if (value < 70) return 'bg-project-yellow';
    return 'bg-project-green';
  };

  return (
    <div 
      className="dashboard-card cursor-pointer"
      onClick={onClick}
    >
      <h3 className="font-semibold mb-2">{project.nom}</h3>
      
      {project.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {project.description}
        </p>
      )}
      
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span>Progrès</span>
          <span>{progress}%</span>
        </div>
        <Progress 
          value={progress} 
          className={`h-1.5 ${getProgressColor(progress)}`}
        />
      </div>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center">
          <User size={14} className="mr-1" />
          <span>Chef: ID {project.chef_projet_id}</span>
        </div>
        <div className="flex items-center">
          <Calendar size={14} className="mr-1" />
          <span>{formatDate(project.date_debut)} - {formatDate(project.date_fin)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
