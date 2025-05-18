
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface ProjectsHeaderProps {
  onCreateClick: () => void;
  canModifyProject: boolean;
}

const ProjectsHeader = ({ onCreateClick, canModifyProject }: ProjectsHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">Liste des projets</h2>
      {canModifyProject && (
        <Button onClick={onCreateClick}>
          <PlusCircle className="mr-2 h-4 w-4" /> Nouveau projet
        </Button>
      )}
    </div>
  );
};

export default ProjectsHeader;
