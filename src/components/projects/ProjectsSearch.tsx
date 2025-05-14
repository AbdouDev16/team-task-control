
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter, Search, SortAsc } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface ProjectsSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterType: string;
  setFilterType: (value: string) => void;
  sortOrder: string;
  setSortOrder: (value: string) => void;
}

const ProjectsSearch: React.FC<ProjectsSearchProps> = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  sortOrder,
  setSortOrder
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="Rechercher un projet..." 
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center">
              <Filter className="mr-2 h-4 w-4" /> Filtrer
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filtrer par</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFilterType('all')}>
              Tous les projets
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType('my-projects')}>
              Mes projets
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType('active')}>
              Projets actifs
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType('completed')}>
              Projets terminés
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center">
              <SortAsc className="mr-2 h-4 w-4" /> Trier
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Trier par</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSortOrder('nom-asc')}>
              Nom (A-Z)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOrder('nom-desc')}>
              Nom (Z-A)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOrder('date-debut')}>
              Date de début
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOrder('date-fin')}>
              Date de fin
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ProjectsSearch;
