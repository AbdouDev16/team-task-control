
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProjectForm from '@/components/forms/ProjectForm';
import { ProjectManager } from '@/hooks/useProjectsService';
import { useAuth } from '@/context/AuthContext';

interface ProjectsHeaderProps {
  projectManagers: ProjectManager[];
  onCreateProject: (formData: any) => Promise<void>;
}

const ProjectsHeader: React.FC<ProjectsHeaderProps> = ({ 
  projectManagers,
  onCreateProject 
}) => {
  const { user } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const canCreateProject = user?.role === 'Admin' || user?.role === 'Gérant';

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async (formData: any) => {
    try {
      await onCreateProject(formData);
      setOpenDialog(false);
    } catch (error) {
      console.error('Error in project creation:', error);
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold">Liste des projets</h1>
      {canCreateProject && (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <Button onClick={handleOpenDialog}>
            <Plus className="mr-2 h-4 w-4" /> Nouveau Projet
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau projet</DialogTitle>
            </DialogHeader>
            <ProjectForm
              onSubmit={handleSubmit}
              onCancel={handleCloseDialog}
              projectManagers={projectManagers}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProjectsHeader;
