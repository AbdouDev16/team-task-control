
import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import ProjectCard from '@/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Filter, 
  SortAsc,
  Search
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

// Mock data
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
  },
  {
    id: 3,
    nom: 'Site E-commerce',
    description: 'Plateforme de vente en ligne pour une boutique de vêtements',
    chef_projet_id: 2,
    date_debut: '2025-06-01',
    date_fin: '2025-09-01'
  },
  {
    id: 4,
    nom: 'Dashboard Analytics',
    description: 'Tableau de bord pour analyse de données commerciales',
    chef_projet_id: 3,
    date_debut: '2025-05-20',
    date_fin: '2025-06-30'
  }
];

const projectProgress = {
  1: 30,
  2: 75,
  3: 10,
  4: 45
};

const Projects = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  
  const canCreateProject = user?.role !== 'Employé';
  
  const filteredProjects = mockProjects.filter(project => 
    project.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Projets" />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Liste des projets</h1>
            {canCreateProject && (
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Nouveau Projet
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter un nouveau projet</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">
                      Cette fonctionnalité serait connectée au backend PHP dans une implémentation réelle.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => setOpenDialog(false)}>
                      Fermer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
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
                  <DropdownMenuItem>Tous les projets</DropdownMenuItem>
                  <DropdownMenuItem>Mes projets</DropdownMenuItem>
                  <DropdownMenuItem>Projets actifs</DropdownMenuItem>
                  <DropdownMenuItem>Projets terminés</DropdownMenuItem>
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
                  <DropdownMenuItem>Nom (A-Z)</DropdownMenuItem>
                  <DropdownMenuItem>Nom (Z-A)</DropdownMenuItem>
                  <DropdownMenuItem>Date de début (récent)</DropdownMenuItem>
                  <DropdownMenuItem>Date de fin (proche)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                progress={projectProgress[project.id as keyof typeof projectProgress] || 0} 
              />
            ))}
          </div>
          
          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucun projet trouvé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;
