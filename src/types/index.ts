
// Types pour l'authentification
export type UserRole = 'Admin' | 'Gérant' | 'Chef_Projet' | 'Employé';

export interface User {
  id: number;
  username: string;
  role: UserRole;
  details?: any;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  apiAvailable: boolean;
}

// Types pour les projets
export interface Project {
  id: number;
  nom: string;
  description: string;
  chef_projet_id: number;
  date_debut: string;
  date_fin: string;
}

export interface ProjectManager {
  id: number;
  nom: string;
  prenom: string;
}

export interface ProjectWithProgress extends Project {
  progress?: number;
  chef_projet_nom?: string;
  chef_projet_prenom?: string;
}

// Types pour les tâches
export type TaskStatus = 'Non commencé' | 'En cours' | 'Terminé' | 'En retard';

export interface Task {
  id: number;
  nom: string;
  description: string;
  projet_id: number;
  employe_id?: number;
  statut: TaskStatus;
  date_debut: string;
  date_fin: string;
}

// Types pour les employés
export interface Employee {
  id: number;
  user_id: number;
  nom: string;
  prenom: string;
}

// Types pour les rapports
export interface Report {
  id: number;
  titre: string;
  contenu: string;
  date_creation: string;
  chef_projet_id: number;
  chef_projet_nom?: string;
  chef_projet_prenom?: string;
}
