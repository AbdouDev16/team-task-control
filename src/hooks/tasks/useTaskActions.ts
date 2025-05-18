
import { Dispatch, SetStateAction } from 'react';
import { taskService } from '@/services/api';
import { Task, Project, Employee } from '@/types';
import { toast } from 'sonner';

interface UseTaskActionsProps {
  apiAvailable: boolean;
  tasks: Task[];
  projects: Project[];
  employees: Employee[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
  canCreateTask: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export const useTaskActions = ({
  apiAvailable,
  tasks,
  setTasks,
  canCreateTask,
  setLoading
}: UseTaskActionsProps) => {
  
  const createTask = async (formData: any) => {
    if (!canCreateTask) {
      toast.error('Vous n\'avez pas les permissions pour créer une tâche');
      return false;
    }

    if (!apiAvailable) {
      toast.error('API indisponible. Impossible de créer une tâche.');
      return false;
    }
    
    try {
      setLoading(true);
      const response = await taskService.create(formData);
      
      if (response.task) {
        setTasks([...tasks, response.task]);
        toast.success('Tâche créée avec succès');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Erreur lors de la création de la tâche');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const updateTask = async (taskId: number, formData: any) => {
    if (!apiAvailable) {
      toast.error('API indisponible. Impossible de mettre à jour la tâche.');
      return false;
    }

    try {
      setLoading(true);
      const response = await taskService.update(taskId, formData);
      
      if (response.task) {
        setTasks(tasks.map(t => t.id === taskId ? response.task : t));
        toast.success('Tâche mise à jour avec succès');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Erreur lors de la mise à jour de la tâche');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const updateTaskStatus = async (taskId: number, status: string) => {
    if (!apiAvailable) {
      toast.error('API indisponible. Impossible de mettre à jour le statut.');
      return false;
    }

    try {
      setLoading(true);
      const response = await taskService.updateStatus(taskId, status);
      
      if (response.task) {
        setTasks(tasks.map(t => t.id === taskId ? response.task : t));
        toast.success('Statut de la tâche mis à jour');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const deleteTask = async (taskId: number) => {
    if (!apiAvailable) {
      toast.error('API indisponible. Impossible de supprimer la tâche.');
      return false;
    }

    try {
      setLoading(true);
      await taskService.delete(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
      toast.success('Tâche supprimée avec succès');
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Erreur lors de la suppression de la tâche');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask
  };
};
