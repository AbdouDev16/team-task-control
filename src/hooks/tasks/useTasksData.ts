
import { useState } from 'react';
import { Task, Project, TaskStatus } from '@/types';
import { taskService, projectService, userService } from '@/services/api';
import { toast } from 'sonner';

interface TaskWithDetails extends Task {
  projet_nom?: string;
  employe_nom?: string;
  employe_prenom?: string;
}

export const useTasksData = (isEmployee: boolean) => {
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTasks = async () => {
    try {
      setLoading(true);
      let response;
      
      // Si l'utilisateur est un employé, charger uniquement ses tâches
      if (isEmployee) {
        // Récupérer l'ID de l'employé connecté depuis le contexte d'authentification
        // Cette valeur devrait être dans le contexte d'authentification
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const employeeId = user.details?.id;
        
        if (employeeId) {
          response = await taskService.getByEmployee(employeeId);
        } else {
          toast.error("Impossible d'identifier l'employé connecté");
          setLoading(false);
          return;
        }
      } else {
        // Sinon, charger toutes les tâches
        response = await taskService.getAll();
      }
      
      if (response.tasks) {
        setTasks(response.tasks);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error('Impossible de charger les tâches. Veuillez réessayer.');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await projectService.getAll();
      if (response.projects) {
        setProjects(response.projects);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Impossible de charger les projets. Veuillez réessayer.');
      setProjects([]);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await userService.getAll();
      if (response.users) {
        const employees = response.users
          .filter((u: any) => u.role === 'Employé')
          .map((u: any) => ({
            id: u.details.id,
            nom: u.details.nom,
            prenom: u.details.prenom
          }));
        setEmployees(employees);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
      toast.error('Impossible de charger les employés. Veuillez réessayer.');
      setEmployees([]);
    }
  };

  const loadTasksData = async () => {
    setLoading(true);
    await Promise.all([
      loadTasks(),
      loadProjects(),
      loadEmployees()
    ]);
    setLoading(false);
  };

  return {
    tasks,
    projects,
    employees,
    loading,
    setTasks,
    setProjects,
    setEmployees,
    loadTasksData
  };
};
