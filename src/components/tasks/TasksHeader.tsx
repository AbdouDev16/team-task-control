
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TaskForm from '@/components/forms/TaskForm';
import { Project, Task } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface TasksHeaderProps {
  title: string;
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  isEditMode: boolean;
  currentTask: Task | null;
  handleOpenDialog: () => void;
  handleCloseDialog: () => void;
  handleCreateTask: (formData: any) => Promise<void>;
  handleUpdateTask: (formData: any) => Promise<void>;
  projects: Project[];
  employees: any[];
}

const TasksHeader: React.FC<TasksHeaderProps> = ({
  title,
  openDialog,
  setOpenDialog,
  isEditMode,
  currentTask,
  handleOpenDialog,
  handleCloseDialog,
  handleCreateTask,
  handleUpdateTask,
  projects,
  employees
}) => {
  const { user } = useAuth();
  const canCreateTask = user?.role === 'Chef_Projet';

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {canCreateTask && (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <Button onClick={handleOpenDialog}>
            <Plus className="mr-2 h-4 w-4" /> Nouvelle tâche
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? "Modifier la tâche" : "Ajouter une nouvelle tâche"}
              </DialogTitle>
            </DialogHeader>
            <TaskForm
              initialData={currentTask || undefined}
              onSubmit={isEditMode ? handleUpdateTask : handleCreateTask}
              onCancel={handleCloseDialog}
              projects={projects}
              employees={employees}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TasksHeader;
