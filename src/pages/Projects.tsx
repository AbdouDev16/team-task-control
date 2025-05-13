
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import ProjectCard from '@/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Filter, 
  SortAsc,
  Search,
  Loader2
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { projectService, userService } from '@/services/api';
import { toast } from 'sonner';
import ProjectForm from '@/components/forms/ProjectForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Project } from '@/types';

interface ProjectWithProgress extends Project {
  progress?: number;
  chef_projet_nom?: string;
  chef_projet_prenom?: string;
}

const Projects = () => {
  const { user, apiAvailable } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [projects, setProjects] = useState<ProjectWithProgress[]>([]);
  const [projectManagers, setProjectManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState('nom-asc');
  const [filterType, setFilterType] = useState('all');
  
  const canCreateProject = user?.role !== 'Employé';

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

  // Filtre et tri des projets
  const filteredAndSortedProjects = projects
    .filter(project => {
      // Filtrer par recherche
      const matchesSearch = project.nom.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtrer par type
      const matchesFilter = filterType === 'all' || 
        (filterType === 'my-projects' && user?.role === 'Chef_Projet' && project.chef_projet_id === user.id) ||
        (filterType === 'active' && new Date(project.date_fin) >= new Date()) ||
        (filterType === 'completed' && new Date(project.date_fin) < new Date() && (project.progress || 0) >= 100);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      // Tri
      switch (sortOrder) {
        case 'nom-asc':
          return a.nom.localeCompare(b.nom);
        case 'nom-desc':
          return b.nom.localeCompare(a.nom);
        case 'date-debut':
          return new Date(a.date_debut).getTime() - new Date(b.date_debut).getTime();
        case 'date-fin':
          return new Date(a.date_fin).getTime() - new Date(b.date_fin).getTime();
        default:
          return 0;
      }
    });

  const handleCreateProject = async (formData: any) => {
    try {
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
      setOpenDialog(false);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error("Erreur lors de la création du projet");
      throw error;
    }
  };

  const handleUpdateProject = async (formData: any) => {
    try {
      if (!currentProject) return;
      
      if (apiAvailable) {
        const response = await projectService.update(currentProject.id, formData);
        // Mettre à jour le projet avec détails appropriés
        const updatedProject = response.project;
        const manager = projectManagers.find(pm => pm.id === updatedProject.chef_projet_id);
        setProjects(projects.map(p => p.id === currentProject.id ? {
          ...updatedProject,
          progress: p.progress,
          chef_projet_nom: manager?.nom,
          chef_projet_prenom: manager?.prenom
        } : p));
      } else {
        // Simulation en mode développement
        const manager = projectManagers.find(pm => pm.id === formData.chef_projet_id);
        setProjects(projects.map(p => p.id === currentProject.id ? {
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
      setOpenDialog(false);
      setCurrentProject(null);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error("Erreur lors de la mise à jour du projet");
      throw error;
    }
  };

  const handleDelete = (id: number) => {
    setProjectToDelete(id);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    
    try {
      setLoading(true);
      if (apiAvailable) {
        await projectService.delete(projectToDelete);
      }
      
      // Mise à jour de l'UI
      setProjects(projects.filter(p => p.id !== projectToDelete));
      toast.success("Projet supprimé avec succès");
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error("Erreur lors de la suppression du projet");
    } finally {
      setLoading(false);
      setProjectToDelete(null);
    }
  };

  const handleEditProject = (project: ProjectWithProgress) => {
    setCurrentProject(project);
    setIsEditMode(true);
    setOpenDialog(true);
  };

  const handleOpenDialog = () => {
    setIsEditMode(false);
    setCurrentProject(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentProject(null);
    setIsEditMode(false);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Projets" />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Liste des projets</h1>
            {canCreateProject && (
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <Button onClick={handleOpenDialog}>
                  <Plus className="mr-2 h-4 w-4" /> Nouveau Projet
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {isEditMode ? "Modifier le projet" : "Ajouter un nouveau projet"}
                    </DialogTitle>
                  </DialogHeader>
                  <ProjectForm
                    initialData={currentProject || undefined}
                    onSubmit={isEditMode ? handleUpdateProject : handleCreateProject}
                    onCancel={handleCloseDialog}
                    projectManagers={projectManagers}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Rechercher un projet..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" /> Filtrer
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filtrer par</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterType('all')}>
                    Tous les projets
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType('my-projects')}>
                    Mes projets
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType('active')}>
                    Projets actifs
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType('completed')}>
                    Projets terminés
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <SortAsc className="mr-2 h-4 w-4" /> Trier
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Trier par</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortOrder('nom-asc')}>
                    Nom (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder('nom-desc')}>
                    Nom (Z-A)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder('date-debut')}>
                    Date de début
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder('date-fin')}>
                    Date de fin
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  progress={project.progress || 0}
                  onEdit={() => handleEditProject(project)}
                  onDelete={() => handleDelete(project.id)}
                />
              ))}
              
              {filteredAndSortedProjects.length === 0 && (
                <div className="col-span-3 text-center py-12">
                  <p className="text-muted-foreground">Aucun projet trouvé</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <AlertDialog open={projectToDelete !== null} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce projet?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le projet et toutes ses tâches associées seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Projects;
