
import { Project } from '@/types';

export interface ProjectWithProgress extends Project {
  progress?: number;
  chef_projet_nom?: string;
  chef_projet_prenom?: string;
}

export interface ProjectManager {
  id: number;
  nom: string;
  prenom: string;
}
