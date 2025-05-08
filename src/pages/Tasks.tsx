
import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import TaskCard from '@/components/TaskCard';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Filter, 
  SortAsc,
  Search,
  Calendar
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data
const mockTasks = [
  {
    id: 1,
    nom: 'Conception de la base de données',
    description: 'Création du schéma de base de données pour le projet CRM',
    projet_id: 1,
    employe_id: 3,
    statut: 'En cours' as const,
    date_debut: '2025-05-01',
    date_fin: '2025-05-15'
  },
  {
    id: 2,
    nom: 'Développement Front-end',
    description: 'Création de l\'interface utilisateur avec React',
    projet_id: 1,
    employe_id: 4,
    statut: 'Non commencé' as const,
    date_debut: '2025-05-16',
    date_fin: '2025-05-30'
  },
  {
    id: 3,
    nom: 'Tests unitaires',
    description: 'Création des tests unitaires pour les différentes fonctionnalités',
    projet_id: 2,
    employe_id: 5,
    statut: 'Terminé' as const,
    date_debut: '2025-04-20',
    date_fin: '2025-04-30'
  },
  {
    id: 4,
    nom: 'Intégration API',
    description: 'Connexion du frontend avec les points d\'API backend',
    projet_id: 1,
    employe_id: 3,
    statut: 'Non commencé' as const,
    date_debut: '2025-06-01',
    date_fin: '2025-06-15'
  },
  {
    id: 5,
    nom: 'Design UI mobile',
    description: 'Création des maquettes pour l\'application mobile',
    projet_id: 2,
    employe_id: 4,
    statut: 'En cours' as const,
    date_debut: '2025-05-05',
    date_fin: '2025-05-20'
  }
];

const Tasks = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  
  const canCreateTask = user?.role !== 'Employé';
  const isEmployee = user?.role === 'Employé';
  
  const filteredTasks = mockTasks
    .filter(task => 
      task.nom.toLowerCase().includes(searchTerm.toLowerCase())
      && (activeTab === 'all' 
          || (activeTab === 'not-started' && task.statut === 'Non commencé')
          || (activeTab === 'in-progress' && task.statut === 'En cours')
          || (activeTab === 'completed' && task.statut === 'Terminé')
      )
      // If user is an employee, only show their tasks (mock user id 4)
      && (!isEmployee || task.employe_id === 4)
    );

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Tâches" />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">
              {isEmployee ? 'Mes tâches' : 'Toutes les tâches'}
            </h1>
            {canCreateTask && (
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Nouvelle tâche
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter une nouvelle tâche</DialogTitle>
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
                placeholder="Rechercher une tâche..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={() => {}}
              >
                <Calendar className="mr-2 h-4 w-4" /> Vue calendrier
              </Button>
            </div>
          </div>
          
          <Tabs 
            defaultValue="all" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="mb-6"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Toutes</TabsTrigger>
              <TabsTrigger value="not-started">Non commencées</TabsTrigger>
              <TabsTrigger value="in-progress">En cours</TabsTrigger>
              <TabsTrigger value="completed">Terminées</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
          
          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucune tâche trouvée</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
