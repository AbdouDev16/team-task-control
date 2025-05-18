
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { ProjectWithProgress } from '@/types';

interface ProjectsListProps {
  projects: ProjectWithProgress[];
  loading: boolean;
  onEdit: (project: ProjectWithProgress) => void;
  onDelete: (projectId: number) => void;
  canModifyProject: boolean;
}

const ProjectsList = ({ projects, loading, onEdit, onDelete, canModifyProject }: ProjectsListProps) => {
  // Format date to readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const isProjectLate = (project: ProjectWithProgress) => {
    if (!project.date_fin) return false;
    const now = new Date();
    const endDate = new Date(project.date_fin);
    return now > endDate && (project.progress || 0) < 100;
  };

  return (
    <Card>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 text-center">Chargement des projets...</div>
        ) : projects.length === 0 ? (
          <div className="p-6 text-center">Aucun projet trouvé</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom du projet</TableHead>
                <TableHead>Chef de projet</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Progression</TableHead>
                {canModifyProject && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id} className={isProjectLate(project) ? 'bg-red-50' : ''}>
                  <TableCell className="font-medium">{project.nom}</TableCell>
                  <TableCell>
                    {project.chef_projet_nom && project.chef_projet_prenom
                      ? `${project.chef_projet_prenom} ${project.chef_projet_nom}`
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    {formatDate(project.date_debut)} - {formatDate(project.date_fin)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={project.progress || 0} className="h-2" />
                      <span className="text-xs">{project.progress}%</span>
                    </div>
                  </TableCell>
                  {canModifyProject && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => onEdit(project)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="text-destructive" onClick={() => onDelete(project.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectsList;
