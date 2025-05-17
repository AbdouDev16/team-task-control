import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useProjectsService, ProjectWithProgress } from '@/hooks/useProjectsService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProjectForm from '@/components/forms/ProjectForm';
import ProjectsHeader from '@/components/projects/ProjectsHeader';
import ProjectsSearch from '@/components/projects/ProjectsSearch';
import ProjectsList from '@/components/projects/ProjectsList';
import DeleteProjectDialog from '@/components/projects/DeleteProjectDialog';

const Projects = () => {
  const { apiAvailable } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProject, setCurrentProject] = useState<ProjectWithProgress | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState('nom-asc');
  const [filterType, setFilterType] = useState('all');
  
  const {
    projects,
    projectManagers,
    loading,
    createProject,
    updateProject,
    deleteProject,
    canModifyProject
  } = useProjectsService(apiAvailable);

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
    const success = await createProject(formData);
    if (success) {
      setOpenDialog(false);
    }
  };

  const handleUpdateProject = async (formData: any) => {
    if (!currentProject) return;
    const success = await updateProject(currentProject.id, formData);
    if (success) {
      setOpenDialog(false);
      setCurrentProject(null);
      setIsEditMode(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    const success = await deleteProject(projectToDelete);
    if (success) {
      setProjectToDelete(null);
    }
  };

  const handleEditProject = (project: ProjectWithProgress) => {
    if (!canModifyProject) return;
    setCurrentProject(project);
    setIsEditMode(true);
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
          <ProjectsHeader 
            projectManagers={projectManagers}
            onCreateProject={handleCreateProject}
          />
          
          <ProjectsSearch 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterType={filterType}
            setFilterType={setFilterType}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
          
          <ProjectsList 
            projects={filteredAndSortedProjects}
            loading={loading}
            onEdit={handleEditProject}
            onDelete={setProjectToDelete}
          />
        </div>
      </div>
      
      {/* Dialog for editing projects */}
      <Dialog open={openDialog && isEditMode} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le projet</DialogTitle>
          </DialogHeader>
          <ProjectForm
            initialData={currentProject || undefined}
            onSubmit={handleUpdateProject}
            onCancel={handleCloseDialog}
            projectManagers={projectManagers}
          />
        </DialogContent>
      </Dialog>
      
      <DeleteProjectDialog 
        projectId={projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteProject}
      />
    </div>
  );
};

export default Projects;
