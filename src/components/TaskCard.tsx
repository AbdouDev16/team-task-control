
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, UserCircle, FileText, Edit, Trash2, CheckCircle2 } from 'lucide-react';
import { Task, TaskStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: Task;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (taskId: number, newStatus: TaskStatus) => void;
  projectName?: string;
  assignee?: string;
}

const TaskCard = ({ task, onEdit, onDelete, onStatusChange, projectName, assignee }: TaskCardProps) => {
  const { user } = useAuth();
  
  // Formater les dates pour l'affichage
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Non définie';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  
  // Calculer si la tâche est en retard
  const isLate = () => {
    if (!task.date_fin) return false;
    const today = new Date();
    const endDate = new Date(task.date_fin);
    return today > endDate && task.statut !== 'Terminé';
  };
  
  // Déterminer le style de la badge selon le statut
  const getStatusStyle = () => {
    if (isLate()) return { color: 'text-white bg-destructive', label: 'En retard' };
    
    switch (task.statut) {
      case 'Non commencé':
        return { color: 'text-white bg-gray-500', label: 'Non commencé' };
      case 'En cours':
        return { color: 'text-white bg-project-blue', label: 'En cours' };
      case 'Terminé':
        return { color: 'text-white bg-green-500', label: 'Terminé' };
      case 'En retard':
        return { color: 'text-white bg-destructive', label: 'En retard' };
      default:
        return { color: 'text-white bg-gray-500', label: task.statut };
    }
  };
  
  const status = getStatusStyle();
  
  // Vérifier si l'utilisateur peut éditer/supprimer la tâche
  const canManage = user?.role !== 'Employé';
  const isAssignedToCurrentUser = user?.role === 'Employé' && user?.id === task.employe_id;
  
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl truncate">{task.nom}</CardTitle>
          <Badge className={status.color}>{status.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <p className="text-muted-foreground line-clamp-3 mb-4">
          {task.description || 'Aucune description'}
        </p>
        <div className="space-y-3">
          {projectName && (
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Projet:</span>
              <span className="ml-auto">{projectName}</span>
            </div>
          )}
          {assignee && (
            <div className="flex items-center gap-2 text-sm">
              <UserCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Assigné à:</span>
              <span className="ml-auto">{assignee}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Début:</span>
            <span className="ml-auto">{formatDate(task.date_debut)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Échéance:</span>
            <span className="ml-auto">{formatDate(task.date_fin)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        {(canManage || isAssignedToCurrentUser) && onStatusChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1">
                Changer le statut
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onStatusChange(task.id, 'Non commencé')}>
                Non commencé
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(task.id, 'En cours')}>
                En cours
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(task.id, 'Terminé')}>
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                Terminé
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(task.id, 'En retard')}>
                En retard
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <div className="flex">
          {onEdit && (
            <Button variant="ghost" size="icon" className="ml-2" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="icon" className="ml-2 text-destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
