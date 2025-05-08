
export type UserRole = 'Admin' | 'Gérant' | 'Chef_Projet' | 'Employé';

export interface User {
  id: number;
  username: string;
  role: UserRole;
}

export interface Employee {
  id: number;
  user_id: number;
  nom: string;
  prenom: string;
}

export interface ProjectManager {
  id: number;
  user_id: number;
  nom: string;
  prenom: string;
}

export interface Manager {
  id: number;
  user_id: number;
  nom: string;
  prenom: string;
}

export interface Project {
  id: number;
  nom: string;
  description: string;
  chef_projet_id: number;
  date_debut: string;
  date_fin: string;
}

export type TaskStatus = 'Non commencé' | 'En cours' | 'Terminé';

export interface Task {
  id: number;
  nom: string;
  description: string;
  projet_id: number;
  employe_id: number;
  statut: TaskStatus;
  date_debut: string;
  date_fin: string;
}

export interface Report {
  id: number;
  titre: string;
  contenu: string;
  date_creation: string;
  chef_projet_id: number;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}
