
import { useState, useEffect } from 'react';
import { Task, Project, TaskStatus } from '@/types';
import { taskService, projectService, userService } from '@/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface TaskWithDetails extends Task {
  projet_nom?: string;
  employe_nom?: string;
  employe_prenom?: string;
}

export const useTasksService = () => {
  const { user, apiAvailable } = useAuth();
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const isEmployee = user?.role === 'Employé';
  const canCreateTask = user?.role !== 'Employé';

  useEffect(() => {
    if (apiAvailable) {
      loadTasks();
      loadProjects();
      loadEmployees();
    } else {
      loadMockData();
    }
  }, [apiAvailable]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      let response;
      if (isEmployee) {
        // Si l'utilisateur est un employé, ne charger que ses tâches
        // Simuler l'id d'employé à 4 pour le développement
        const employeeId = 4; // En production, il faudrait obtenir l'ID réel de l'employé
        response = await taskService.getByEmployee(employeeId);
      } else {
        response = await taskService.getAll();
      }
      
      if (response.tasks) {
        setTasks(response.tasks);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error('Impossible de charger les tâches');
      setLoading(false);
      loadMockData();
    }
  };

  const loadProjects = async () => {
    try {
      const response = await projectService.getAll();
      if (response.projects) {
        setProjects(response.projects);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      // Utiliser des données mockées pour les projets
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
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
      // Charger des données mockées pour les employés
    }
  };

  const loadMockData = () => {
    // Utilisation des données mockées pour le développement
    const mockTasks = [
      {
        id: 1,
        nom: 'Conception de la base de données',
        description: 'Création du schéma de base de données pour le projet CRM',
        projet_id: 1,
        projet_nom: 'CRM Entreprise',
        employe_id: 3,
        employe_nom: 'Durand',
        employe_prenom: 'Emma',
        statut: 'En cours' as TaskStatus,
        date_debut: '2025-05-01',
        date_fin: '2025-05-15'
      },
      {
        id: 2,
        nom: 'Développement Front-end',
        description: 'Création de l\'interface utilisateur avec React',
        projet_id: 1,
        projet_nom: 'CRM Entreprise',
        employe_id: 4,
        employe_nom: 'Leroy',
        employe_prenom: 'Thomas',
        statut: 'Non commencé' as TaskStatus,
        date_debut: '2025-05-16',
        date_fin: '2025-05-30'
      },
      {
        id: 3,
        nom: 'Tests unitaires',
        description: 'Création des tests unitaires pour les différentes fonctionnalités',
        projet_id: 2,
        projet_nom: 'Application Mobile',
        employe_id: 5,
        employe_nom: 'Moreau',
        employe_prenom: 'Julie',
        statut: 'Terminé' as TaskStatus,
        date_debut: '2025-04-20',
        date_fin: '2025-04-30'
      },
      {
        id: 4,
        nom: 'Intégration API',
        description: 'Connexion du frontend avec les points d\'API backend',
        projet_id: 1,
        projet_nom: 'CRM Entreprise',
        employe_id: 3,
        employe_nom: 'Durand',
        employe_prenom: 'Emma',
        statut: 'Non commencé' as TaskStatus,
        date_debut: '2025-06-01',
        date_fin: '2025-06-15'
      },
      {
        id: 5,
        nom: 'Design UI mobile',
        description: 'Création des maquettes pour l\'application mobile',
        projet_id: 2,
        projet_nom: 'Application Mobile',
        employe_id: 4,
        employe_nom: 'Leroy',
        employe_prenom: 'Thomas',
        statut: 'En cours' as TaskStatus,
        date_debut: '2025-05-05',
        date_fin: '2025-05-20'
      }
    ];
    
    const mockProjects = [
      {
        id: 1,
        nom: 'CRM Entreprise',
        description: 'Système de gestion de la relation client pour PME',
        chef_projet_id: 2,
        date_debut: '2025-05-01',
        date_fin: '2025-07-30'
      },
      {
        id: 2,
        nom: 'Application Mobile',
        description: 'Application mobile de suivi de stock pour entrepôts',
        chef_projet_id: 3,
        date_debut: '2025-04-15',
        date_fin: '2025-06-15'
      }
    ];
    
    const mockEmployees = [
      { id: 3, nom: 'Durand', prenom: 'Emma' },
      { id: 4, nom: 'Leroy', prenom: 'Thomas' },
      { id: 5, nom: 'Moreau', prenom: 'Julie' }
    ];
    
    // Si l'utilisateur est un employé, ne montrer que ses tâches (simuler avec l'ID 4)
    const filteredTasks = isEmployee 
      ? mockTasks.filter(task => task.employe_id === 4)
      : mockTasks;
    
    setTasks(filteredTasks);
    setProjects(mockProjects);
    setEmployees(mockEmployees);
    setLoading(false);
  };

  const createTask = async (formData: any) => {
    try {
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
      if (apiAvailable) {
        const response = await taskService.update(taskId, formData);
        // Mettre à jour la tâche avec projets et employés appropriés
        const updatedTask = response.task;
        const project = projects.find(p => p.id === updatedTask.projet_id);
        const employee = formData.employe_id ? employees.find(e => e.id === updatedTask.employe_id) : null;
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
    tasks,
    projects,
    employees,
    loading,
    isEmployee,
    canCreateTask,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask
  };
};
