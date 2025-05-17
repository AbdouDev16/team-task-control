import { useState, useEffect } from 'react';
import { projectService, userService } from '@/services/api';
import { Project } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export interface ProjectWithProgress extends Project {
  progress?: number;
  chef_projet_nom?: string;
  chef_projet_prenom?: string;
}

export interface ProjectManager {
  id: number;
  nom: string;
  prenom: string;
}

export function useProjectsService(apiAvailable: boolean) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectWithProgress[]>([]);
  const [projectManagers, setProjectManagers] = useState<ProjectManager[]>([]);
  const [loading, setLoading] = useState(false);

  const canModifyProject = user?.role === 'Admin' || user?.role === 'Gérant';

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
    projects,
    projectManagers,
    loading,
    createProject,
    updateProject,
    deleteProject,
    canModifyProject
  };
}
