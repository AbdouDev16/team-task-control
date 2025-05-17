
import { projectService } from '@/services/api';
import { toast } from 'sonner';
import { ProjectWithProgress, ProjectManager } from './types';
import { Dispatch, SetStateAction } from 'react';

interface UseProjectActionsProps {
  apiAvailable: boolean;
  projects: ProjectWithProgress[];
  projectManagers: ProjectManager[];
  setProjects: Dispatch<SetStateAction<ProjectWithProgress[]>>;
  canModifyProject: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export function useProjectActions({
  apiAvailable,
  projects,
  projectManagers,
  setProjects,
  canModifyProject,
  setLoading
}: UseProjectActionsProps) {

  const createProject = async (formData: any) => {
    try {
      if (!canModifyProject) {
        toast.error("Seuls les administrateurs et les gérants peuvent créer des projets");
        return false;
      }
      
      if (apiAvailable) {
        const response = await projectService.create(formData);
        // Ajouter le projet avec chef de projet approprié
        const newProject = response.project;
        const manager = projectManagers.find(pm => pm.id === newProject.chef_projet_id);
        setProjects([...projects, {
          ...newProject,
          progress: 0,
          chef_projet_nom: manager?.nom,
          chef_projet_prenom: manager?.prenom
        }]);
      } else {
        // Simulation en mode développement
        const manager = projectManagers.find(pm => pm.id === formData.chef_projet_id);
        const newProject = {
          id: projects.length + 1,
          nom: formData.nom,
          description: formData.description,
          chef_projet_id: formData.chef_projet_id,
          chef_projet_nom: manager?.nom,
          chef_projet_prenom: manager?.prenom,
          date_debut: formData.date_debut,
          date_fin: formData.date_fin,
          progress: 0
        };
        setProjects([...projects, newProject]);
      }
      toast.success("Projet créé avec succès");
      return true;
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error("Erreur lors de la création du projet");
      throw error;
    }
  };

  const updateProject = async (projectId: number, formData: any) => {
    try {
      if (!canModifyProject) {
        toast.error("Seuls les administrateurs et les gérants peuvent modifier des projets");
        return false;
      }
      
      if (apiAvailable) {
        const response = await projectService.update(projectId, formData);
        // Mettre à jour le projet avec détails appropriés
        const updatedProject = response.project;
        const manager = projectManagers.find(pm => pm.id === updatedProject.chef_projet_id);
        setProjects(projects.map(p => p.id === projectId ? {
          ...updatedProject,
          progress: p.progress,
          chef_projet_nom: manager?.nom,
          chef_projet_prenom: manager?.prenom
        } : p));
      } else {
        // Simulation en mode développement
        const manager = projectManagers.find(pm => pm.id === formData.chef_projet_id);
        setProjects(projects.map(p => p.id === projectId ? {
          ...p,
          nom: formData.nom,
          description: formData.description,
          chef_projet_id: formData.chef_projet_id,
          chef_projet_nom: manager?.nom,
          chef_projet_prenom: manager?.prenom,
          date_debut: formData.date_debut,
          date_fin: formData.date_fin
        } : p));
      }
      
      toast.success("Projet mis à jour avec succès");
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error("Erreur lors de la mise à jour du projet");
      throw error;
    }
  };

  const deleteProject = async (projectId: number) => {
    try {
      if (!canModifyProject) {
        toast.error("Seuls les administrateurs et les gérants peuvent supprimer des projets");
        return false;
      }
      
      setLoading(true);
      if (apiAvailable) {
        await projectService.delete(projectId);
      }
      
      // Mise à jour de l'UI
      setProjects(projects.filter(p => p.id !== projectId));
      toast.success("Projet supprimé avec succès");
      return true;
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error("Erreur lors de la suppression du projet");
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
}
