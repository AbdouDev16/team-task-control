
import { Dispatch, SetStateAction } from 'react';
import { projectService } from '@/services/api';
import { ProjectWithProgress, ProjectManager } from '@/types';
import { toast } from 'sonner';

interface UseProjectActionsProps {
  apiAvailable: boolean;
  projects: ProjectWithProgress[];
  projectManagers: ProjectManager[];
  setProjects: Dispatch<SetStateAction<ProjectWithProgress[]>>;
  canModifyProject: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export const useProjectActions = ({
  apiAvailable,
  projects,
  setProjects,
  canModifyProject,
  setLoading
}: UseProjectActionsProps) => {

  const createProject = async (formData: any) => {
    if (!canModifyProject) {
      toast.error('Vous n\'avez pas les permissions pour créer un projet');
      return false;
    }

    if (!apiAvailable) {
      toast.error('API indisponible. Impossible de créer un projet.');
      return false;
    }
    
    try {
      setLoading(true);
      console.log('Creating project with data:', formData);
      const response = await projectService.create(formData);
      console.log('Project creation response:', response);
      
      if (response && response.project) {
        setProjects([...projects, { ...response.project, progress: 0 }]);
        toast.success('Projet créé avec succès');
        return true;
      } else {
        console.error('Invalid response format:', response);
        toast.error('Format de réponse invalide lors de la création du projet');
        return false;
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Erreur lors de la création du projet');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const updateProject = async (projectId: number, formData: any) => {
    if (!canModifyProject) {
      toast.error('Vous n\'avez pas les permissions pour modifier un projet');
      return false;
    }

    if (!apiAvailable) {
      toast.error('API indisponible. Impossible de modifier un projet.');
      return false;
    }
    
    try {
      setLoading(true);
      const response = await projectService.update(projectId, formData);
      
      if (response.project) {
        setProjects(
          projects.map(p => 
            p.id === projectId 
              ? { ...response.project, progress: p.progress } 
              : p
          )
        );
        toast.success('Projet mis à jour avec succès');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Erreur lors de la mise à jour du projet');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const deleteProject = async (projectId: number) => {
    if (!canModifyProject) {
      toast.error('Vous n\'avez pas les permissions pour supprimer un projet');
      return false;
    }

    if (!apiAvailable) {
      toast.error('API indisponible. Impossible de supprimer un projet.');
      return false;
    }
    
    try {
      setLoading(true);
      await projectService.delete(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
      toast.success('Projet supprimé avec succès');
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Erreur lors de la suppression du projet');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    createProject,
    updateProject,
    deleteProject
  };
};
