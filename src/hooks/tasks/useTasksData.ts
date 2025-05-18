
import { useState } from 'react';
import { Task, Project, Employee } from '@/types';
import { taskService, projectService, userService } from '@/services/api';
import { toast } from 'sonner';

interface UseTasksDataProps {
  isEmployee: boolean;
  apiAvailable: boolean;
}

export const useTasksData = ({ isEmployee, apiAvailable }: UseTasksDataProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTasksData = async () => {
    if (!apiAvailable) {
      console.log("API indisponible, chargement des tâches annulé");
      return;
    }

    setLoading(true);
    
    try {
      // Charger les tâches
      const tasksResponse = await taskService.getAll();
      if (tasksResponse.tasks) {
        setTasks(tasksResponse.tasks);
      }
      
      // Charger les projets
      const projectsResponse = await projectService.getAll();
      if (projectsResponse.projects) {
        setProjects(projectsResponse.projects);
      }
      
      // Charger les employés
      const usersResponse = await userService.getAll();
      if (usersResponse.users) {
        const employeeUsers = usersResponse.users
          .filter((user: any) => user.role === 'Employé')
          .map((user: any) => user.details);
        
        setEmployees(employeeUsers);
      }
    } catch (error) {
      console.error('Error loading tasks data:', error);
      toast.error('Impossible de charger les données des tâches');
      setTasks([]);
      setProjects([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    tasks,
    projects,
    employees,
    loading,
    setLoading,
    setTasks,
    setProjects,
    setEmployees,
    loadTasksData
  };
};
