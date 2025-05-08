
import { User, Project, Task, Report } from '../types';

const API_URL = 'http://localhost/gestion_des_projets/api'; // Ajustez l'URL selon votre configuration locale

// Fonction générique pour les requêtes HTTP
const fetchData = async (
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', 
  body: any = null
) => {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Pour envoyer les cookies avec les requêtes
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}/${endpoint}`, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Une erreur est survenue');
    }

    // Pour les requêtes DELETE qui peuvent ne pas retourner de contenu
    if (method === 'DELETE') {
      return { success: true };
    }

    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Authentification
export const authService = {
  login: (username: string, password: string) => 
    fetchData('auth/login.php', 'POST', { username, password }),
  
  logout: () => 
    fetchData('auth/logout.php', 'POST'),
  
  getCurrentUser: () => 
    fetchData('auth/user.php')
};

// Projets
export const projectService = {
  getAll: () => 
    fetchData('projects/index.php'),
  
  getById: (id: number) => 
    fetchData(`projects/show.php?id=${id}`),
  
  create: (project: Omit<Project, 'id'>) => 
    fetchData('projects/create.php', 'POST', project),
  
  update: (id: number, project: Partial<Project>) => 
    fetchData(`projects/update.php?id=${id}`, 'PUT', project),
  
  delete: (id: number) => 
    fetchData(`projects/delete.php?id=${id}`, 'DELETE')
};

// Tâches
export const taskService = {
  getAll: () => 
    fetchData('tasks/index.php'),
  
  getByProject: (projectId: number) => 
    fetchData(`tasks/by_project.php?project_id=${projectId}`),
  
  getByEmployee: (employeeId: number) => 
    fetchData(`tasks/by_employee.php?employee_id=${employeeId}`),
  
  getById: (id: number) => 
    fetchData(`tasks/show.php?id=${id}`),
  
  create: (task: Omit<Task, 'id'>) => 
    fetchData('tasks/create.php', 'POST', task),
  
  update: (id: number, task: Partial<Task>) => 
    fetchData(`tasks/update.php?id=${id}`, 'PUT', task),
  
  updateStatus: (id: number, status: string) => 
    fetchData(`tasks/update_status.php?id=${id}`, 'PUT', { statut: status }),
  
  delete: (id: number) => 
    fetchData(`tasks/delete.php?id=${id}`, 'DELETE')
};

// Utilisateurs
export const userService = {
  getAll: () => 
    fetchData('users/index.php'),
  
  getById: (id: number) => 
    fetchData(`users/show.php?id=${id}`),
  
  create: (user: Omit<User, 'id'>) => 
    fetchData('users/create.php', 'POST', user),
  
  update: (id: number, user: Partial<User>) => 
    fetchData(`users/update.php?id=${id}`, 'PUT', user),
  
  delete: (id: number) => 
    fetchData(`users/delete.php?id=${id}`, 'DELETE')
};

// Rapports
export const reportService = {
  getAll: () => 
    fetchData('reports/index.php'),
  
  getById: (id: number) => 
    fetchData(`reports/show.php?id=${id}`),
  
  create: (report: Omit<Report, 'id'>) => 
    fetchData('reports/create.php', 'POST', report),
  
  update: (id: number, report: Partial<Report>) => 
    fetchData(`reports/update.php?id=${id}`, 'PUT', report),
  
  delete: (id: number) => 
    fetchData(`reports/delete.php?id=${id}`, 'DELETE')
};
