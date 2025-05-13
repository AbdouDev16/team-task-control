
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Edit, Trash2, Users } from 'lucide-react';
import { Project } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/button';

interface ProjectWithProgress extends Project {
  progress?: number;
  chef_projet_nom?: string;
  chef_projet_prenom?: string;
}

interface ProjectCardProps {
  project: ProjectWithProgress;
  progress: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ProjectCard = ({ project, progress, onEdit, onDelete }: ProjectCardProps) => {
  const { user } = useAuth();
  
  // Formater les dates pour l'affichage
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Non définie';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  
  // Calculer si le projet est en retard
  const isLate = () => {
    if (!project.date_fin) return false;
    const today = new Date();
    const endDate = new Date(project.date_fin);
    return today > endDate && progress < 100;
  };
  
  // Déterminer le statut du projet
  const getStatus = () => {
    if (isLate()) return { label: 'En retard', color: 'bg-destructive' };
    if (progress >= 100) return { label: 'Terminé', color: 'bg-green-500' };
    if (progress > 0) return { label: 'En cours', color: 'bg-project-blue' };
    return { label: 'Non commencé', color: 'bg-gray-500' };
  };
  
  const status = getStatus();

  // Vérifier si l'utilisateur peut éditer/supprimer le projet
  const canEdit = user?.role !== 'Employé';
  const canDelete = user?.role === 'Admin' || user?.role === 'Gérant';
  const isProjectManager = user?.role === 'Chef_Projet' && project.chef_projet_id === user.id;
  
  const displayedManager = project.chef_projet_nom
    ? `${project.chef_projet_prenom} ${project.chef_projet_nom}`
    : `Chef de projet #${project.chef_projet_id}`;

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl truncate">{project.nom}</CardTitle>
          <Badge className={status.color}>{status.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <p className="text-muted-foreground line-clamp-3 mb-4">
          {project.description || 'Aucune description'}
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Début:</span>
            <span className="ml-auto">{formatDate(project.date_debut)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Fin prévue:</span>
            <span className="ml-auto">{formatDate(project.date_fin)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Chef:</span>
            <span className="ml-auto">{displayedManager}</span>
          </div>
          <div className="pt-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Progression</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="outline" asChild className="flex-1">
          <a href={`/projects/${project.id}`}>
            Détails
          </a>
        </Button>
        <div className="flex">
          {(canEdit || isProjectManager) && onEdit && (
            <Button variant="ghost" size="icon" className="ml-2" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {(canDelete || isProjectManager) && onDelete && (
            <Button variant="ghost" size="icon" className="ml-2 text-destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
