
import { useState, useEffect } from 'react';
import { projectService, userService } from '@/services/api';
import { Project } from '@/types';
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
    if (apiAvailable) {
      loadProjects();
      loadProjectManagers();
    } else {
      loadMockData();
    }
  }, [apiAvailable]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getAll();
      if (response.projects) {
        // Ajouter une valeur de progression simulée pour chaque projet
        const projectsWithProgress = response.projects.map((project: any) => ({
          ...project,
          progress: Math.floor(Math.random() * 100)
        }));
        setProjects(projectsWithProgress);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Impossible de charger les projets');
      setLoading(false);
      loadMockData();
    }
  };

  const loadProjectManagers = async () => {
    try {
      // En situation réelle, ce serait une API spécifique pour les chefs de projet
      // Mais ici on utilise la liste des utilisateurs et on filtre
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
      }
    } catch (error) {
      console.error('Failed to load project managers:', error);
      // Charger des données mockées pour les chefs de projet
      const mockManagers = [
        { id: 1, nom: 'Bernard', prenom: 'Sophie' },
        { id: 2, nom: 'Petit', prenom: 'Antoine' }
      ];
      setProjectManagers(mockManagers);
    }
  };

  const loadMockData = () => {
    // Utilisation des données mockées pour le développement
    const mockProjects = [
      {
        id: 1,
        nom: 'CRM Entreprise',
        description: 'Système de gestion de la relation client pour PME',
        chef_projet_id: 1,
        chef_projet_nom: 'Bernard',
        chef_projet_prenom: 'Sophie',
        date_debut: '2025-05-01',
        date_fin: '2025-07-30',
        progress: 30
      },
      {
        id: 2,
        nom: 'Application Mobile',
        description: 'Application mobile de suivi de stock pour entrepôts',
        chef_projet_id: 2,
        chef_projet_nom: 'Petit',
        chef_projet_prenom: 'Antoine',
        date_debut: '2025-04-15',
        date_fin: '2025-06-15',
        progress: 75
      },
      {
        id: 3,
        nom: 'Site E-commerce',
        description: 'Plateforme de vente en ligne pour une boutique de vêtements',
        chef_projet_id: 1,
        chef_projet_nom: 'Bernard',
        chef_projet_prenom: 'Sophie',
        date_debut: '2025-06-01',
        date_fin: '2025-09-01',
        progress: 10
      },
      {
        id: 4,
        nom: 'Dashboard Analytics',
        description: 'Tableau de bord pour analyse de données commerciales',
        chef_projet_id: 2,
        chef_projet_nom: 'Petit',
        chef_projet_prenom: 'Antoine',
        date_debut: '2025-05-20',
        date_fin: '2025-06-30',
        progress: 45
      }
    ];
    
    const mockManagers = [
      { id: 1, nom: 'Bernard', prenom: 'Sophie' },
      { id: 2, nom: 'Petit', prenom: 'Antoine' }
    ];
    
    setProjects(mockProjects);
    setProjectManagers(mockManagers);
    setLoading(false);
  };

  return {
    projects,
    projectManagers,
    loading,
    setProjects,
    setProjectManagers,
    setLoading,
    loadProjects,
    loadProjectManagers,
    loadMockData
  };
}
