
import { useState, useEffect } from 'react';
import { projectService, userService } from '@/services/api';
import { toast } from 'sonner';
import { ProjectWithProgress, ProjectManager } from './types';

interface UseProjectsDataProps {
  apiAvailable: boolean;
  isEmployee: boolean;
}

export function useProjectsData({ apiAvailable, isEmployee }: UseProjectsDataProps) {
  const [projects, setProjects] = useState<ProjectWithProgress[]>([]);
  const [projectManagers, setProjectManagers] = useState<ProjectManager[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProjects();
    loadProjectManagers();
  }, [apiAvailable]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getAll();
      if (response.projects) {
        // Ajouter une valeur de progression calculée pour chaque projet
        const projectsWithProgress = response.projects.map((project: any) => ({
          ...project,
          progress: calculateProjectProgress(project)
        }));
        setProjects(projectsWithProgress);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Impossible de charger les projets. Veuillez réessayer.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour calculer la progression d'un projet (peut être améliorée plus tard)
  const calculateProjectProgress = (project: any): number => {
    // Pour l'instant, on utilise une valeur aléatoire
    // Dans une implémentation réelle, cette valeur devrait être basée sur 
    // la proportion de tâches terminées par rapport au total des tâches
    return Math.floor(Math.random() * 100);
  };

  const loadProjectManagers = async () => {
    try {
      // Récupérer la liste des chefs de projet
      const response = await userService.getAll();
      if (response.users) {
        const managers = response.users
          .filter((u: any) => u.role === 'Chef_Projet')
          .map((u: any) => ({
            id: u.details.id,
            nom: u.details.nom,
            prenom: u.details.prenom
          }));
        setProjectManagers(managers);
      } else {
        setProjectManagers([]);
      }
    } catch (error) {
      console.error('Failed to load project managers:', error);
      toast.error('Impossible de charger les chefs de projet. Veuillez réessayer.');
      setProjectManagers([]);
    }
  };

  return {
    projects,
    projectManagers,
    loading,
    setProjects,
    setProjectManagers,
    setLoading,
    loadProjects,
    loadProjectManagers
  };
}
