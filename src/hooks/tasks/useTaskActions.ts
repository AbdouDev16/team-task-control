
import { TaskStatus } from '@/types';
import { taskService } from '@/services/api';
import { toast } from 'sonner';

interface TaskActionsProps {
  apiAvailable: boolean | undefined;
  tasks: any[];
  projects: any[];
  employees: any[];
  setTasks: (tasks: any[]) => void;
  canCreateTask: boolean;
  setLoading: (loading: boolean) => void;
}

export const useTaskActions = ({
  apiAvailable,
  tasks,
  projects,
  employees,
  setTasks,
  canCreateTask,
  setLoading
}: TaskActionsProps) => {
  const createTask = async (formData: any) => {
    try {
      if (!canCreateTask) {
        toast.error("Seuls les chefs de projet peuvent créer des tâches");
        return false;
      }
      
      if (apiAvailable) {
        const response = await taskService.create(formData);
        // Ajouter la tâche avec projets et employés appropriés
        const newTask = response.task;
        const project = projects.find(p => p.id === newTask.projet_id);
        const employee = formData.employe_id ? employees.find(e => e.id === newTask.employe_id) : null;
        setTasks([...tasks, {
          ...newTask,
          projet_nom: project?.nom,
          employe_nom: employee?.nom,
          employe_prenom: employee?.prenom
        }]);
      } else {
        // Simulation en mode développement
        const project = projects.find(p => p.id === formData.projet_id);
        const employee = formData.employe_id ? employees.find(e => e.id === formData.employe_id) : null;
        const newTask = {
          id: tasks.length + 1,
          nom: formData.nom,
          description: formData.description,
          projet_id: formData.projet_id,
          projet_nom: project?.nom,
          employe_id: formData.employe_id,
          employe_nom: employee?.nom,
          employe_prenom: employee?.prenom,
          statut: formData.statut,
          date_debut: formData.date_debut,
          date_fin: formData.date_fin
        };
        setTasks([...tasks, newTask]);
      }
      toast.success("Tâche créée avec succès");
      return true;
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error("Erreur lors de la création de la tâche");
      throw error;
    }
  };

  const updateTask = async (taskId: number, formData: any) => {
    try {
      if (!canCreateTask) {
        toast.error("Seuls les chefs de projet peuvent modifier des tâches");
        return false;
      }
      
      if (apiAvailable) {
        const response = await taskService.update(taskId, formData);
        // Mettre à jour la tâche avec projets et employés appropriés
        const updatedTask = response.task;
        const project = projects.find(p => p.id === updatedTask.projet_id);
        const employee = formData.employe_id ? employees.find(e => e.id === formData.employe_id) : null;
        setTasks(tasks.map(t => t.id === taskId ? {
          ...updatedTask,
          projet_nom: project?.nom,
          employe_nom: employee?.nom,
          employe_prenom: employee?.prenom
        } : t));
      } else {
        // Simulation en mode développement
        const project = projects.find(p => p.id === formData.projet_id);
        const employee = formData.employe_id ? employees.find(e => e.id === formData.employe_id) : null;
        setTasks(tasks.map(t => t.id === taskId ? {
          ...t,
          nom: formData.nom,
          description: formData.description,
          projet_id: formData.projet_id,
          projet_nom: project?.nom,
          employe_id: formData.employe_id,
          employe_nom: employee?.nom,
          employe_prenom: employee?.prenom,
          statut: formData.statut,
          date_debut: formData.date_debut,
          date_fin: formData.date_fin
        } : t));
      }
      
      toast.success("Tâche mise à jour avec succès");
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error("Erreur lors de la mise à jour de la tâche");
      throw error;
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: TaskStatus) => {
    try {
      if (apiAvailable) {
        await taskService.updateStatus(taskId, newStatus);
      }
      
      // Mise à jour de l'UI
      setTasks(tasks.map(t => t.id === taskId ? { ...t, statut: newStatus } : t));
      toast.success(`Statut mis à jour: ${newStatus}`);
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      setLoading(true);
      if (apiAvailable) {
        await taskService.delete(taskId);
      }
      
      // Mise à jour de l'UI
      setTasks(tasks.filter(t => t.id !== taskId));
      toast.success("Tâche supprimée avec succès");
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error("Erreur lors de la suppression de la tâche");
      setLoading(false);
      return false;
    }
  };

  return {
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask
  };
};
