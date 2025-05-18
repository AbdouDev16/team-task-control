
import { useState, useEffect } from 'react';
import { projectService, userService } from '@/services/api';
import { toast } from 'sonner';
import { ProjectWithProgress, ProjectManager } from '@/types';

interface UseProjectsDataProps {
  apiAvailable: boolean;
  isEmployee: boolean;
}

export function useProjectsData({ apiAvailable, isEmployee }: UseProjectsDataProps) {
  const [projects, setProjects] = useState<ProjectWithProgress[]>([]);
  const [projectManagers, setProjectManagers] = useState<ProjectManager[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProjects = async () => {
    if (!apiAvailable) {
      console.log("API indisponible, chargement des projets annulé");
      return;
    }

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

  // Fonction pour calculer la progression d'un projet
  const calculateProjectProgress = (project: any): number => {
    // Si le projet contient déjà des tâches
    if (project.tasks && Array.isArray(project.tasks)) {
      const totalTasks = project.tasks.length;
      if (totalTasks === 0) return 0;
      
      const completedTasks = project.tasks.filter(
        (task: any) => task.statut === 'Terminé'
      ).length;
      
      return Math.floor((completedTasks / totalTasks) * 100);
    }
    
    // Sinon, on utilise une valeur aléatoire (à remplacer par une vraie logique)
    return Math.floor(Math.random() * 100);
  };

  const loadProjectManagers = async () => {
    if (!apiAvailable) {
      console.log("API indisponible, chargement des chefs de projet annulé");
      return;
    }

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
