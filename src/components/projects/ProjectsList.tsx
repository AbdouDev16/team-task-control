
import React from 'react';
import { Loader2 } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';
import { ProjectWithProgress } from '@/hooks/useProjectsService';
import { useAuth } from '@/context/AuthContext';

interface ProjectsListProps {
  projects: ProjectWithProgress[];
  loading: boolean;
  onEdit: (project: ProjectWithProgress) => void;
  onDelete: (projectId: number) => void;
}

const ProjectsList: React.FC<ProjectsListProps> = ({
  projects,
  loading,
  onEdit,
  onDelete
}) => {
  const { user } = useAuth();
  const canModifyProject = user?.role === 'Admin' || user?.role === 'Gérant';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard 
          key={project.id} 
          project={project} 
          progress={project.progress || 0}
          onEdit={canModifyProject ? () => onEdit(project) : undefined}
          onDelete={canModifyProject ? () => onDelete(project.id) : undefined}
        />
      ))}
      
      {projects.length === 0 && (
        <div className="col-span-3 text-center py-12">
          <p className="text-muted-foreground">Aucun projet trouvé</p>
        </div>
      )}
    </div>
  );
};

export default ProjectsList;
