
import React, { useState, useEffect } from 'react';
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
  Calendar,
  Loader2
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
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Task, Project, TaskStatus } from '@/types';
import { taskService, projectService, userService } from '@/services/api';
import { toast } from 'sonner';
import TaskForm from '@/components/forms/TaskForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TaskWithDetails extends Task {
  projet_nom?: string;
  employe_nom?: string;
  employe_prenom?: string;
}

const Tasks = () => {
  const { user, apiAvailable } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const canCreateTask = user?.role !== 'Employé';
  const isEmployee = user?.role === 'Employé';
  
  useEffect(() => {
    if (apiAvailable) {
      loadTasks();
      loadProjects();
      loadEmployees();
    } else {
      loadMockData();
    }
  }, [apiAvailable]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      let response;
      if (isEmployee) {
        // Si l'utilisateur est un employé, ne charger que ses tâches
        // Simuler l'id d'employé à 4 pour le développement
        const employeeId = 4; // En production, il faudrait obtenir l'ID réel de l'employé
        response = await taskService.getByEmployee(employeeId);
      } else {
        response = await taskService.getAll();
      }
      
      if (response.tasks) {
        setTasks(response.tasks);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error('Impossible de charger les tâches');
      setLoading(false);
      loadMockData();
    }
  };

  const loadProjects = async () => {
    try {
      const response = await projectService.getAll();
      if (response.projects) {
        setProjects(response.projects);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      // Utiliser des données mockées pour les projets
    }
  };

  const loadEmployees = async () => {
    try {
      // En situation réelle, ce serait une API spécifique pour les employés
      const response = await userService.getAll();
      if (response.users) {
        const employees = response.users
          .filter((u: any) => u.role === 'Employé')
          .map((u: any) => ({
            id: u.details.id,
            nom: u.details.nom,
            prenom: u.details.prenom
          }));
        setEmployees(employees);
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
      // Charger des données mockées pour les employés
    }
  };

  const loadMockData = () => {
    // Utilisation des données mockées pour le développement
    const mockTasks = [
      {
        id: 1,
        nom: 'Conception de la base de données',
        description: 'Création du schéma de base de données pour le projet CRM',
        projet_id: 1,
        projet_nom: 'CRM Entreprise',
        employe_id: 3,
        employe_nom: 'Durand',
        employe_prenom: 'Emma',
        statut: 'En cours' as TaskStatus,
        date_debut: '2025-05-01',
        date_fin: '2025-05-15'
      },
      {
        id: 2,
        nom: 'Développement Front-end',
        description: 'Création de l\'interface utilisateur avec React',
        projet_id: 1,
        projet_nom: 'CRM Entreprise',
        employe_id: 4,
        employe_nom: 'Leroy',
        employe_prenom: 'Thomas',
        statut: 'Non commencé' as TaskStatus,
        date_debut: '2025-05-16',
        date_fin: '2025-05-30'
      },
      {
        id: 3,
        nom: 'Tests unitaires',
        description: 'Création des tests unitaires pour les différentes fonctionnalités',
        projet_id: 2,
        projet_nom: 'Application Mobile',
        employe_id: 5,
        employe_nom: 'Moreau',
        employe_prenom: 'Julie',
        statut: 'Terminé' as TaskStatus,
        date_debut: '2025-04-20',
        date_fin: '2025-04-30'
      },
      {
        id: 4,
        nom: 'Intégration API',
        description: 'Connexion du frontend avec les points d\'API backend',
        projet_id: 1,
        projet_nom: 'CRM Entreprise',
        employe_id: 3,
        employe_nom: 'Durand',
        employe_prenom: 'Emma',
        statut: 'Non commencé' as TaskStatus,
        date_debut: '2025-06-01',
        date_fin: '2025-06-15'
      },
      {
        id: 5,
        nom: 'Design UI mobile',
        description: 'Création des maquettes pour l\'application mobile',
        projet_id: 2,
        projet_nom: 'Application Mobile',
        employe_id: 4,
        employe_nom: 'Leroy',
        employe_prenom: 'Thomas',
        statut: 'En cours' as TaskStatus,
        date_debut: '2025-05-05',
        date_fin: '2025-05-20'
      }
    ];
    
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
      }
    ];
    
    const mockEmployees = [
      { id: 3, nom: 'Durand', prenom: 'Emma' },
      { id: 4, nom: 'Leroy', prenom: 'Thomas' },
      { id: 5, nom: 'Moreau', prenom: 'Julie' }
    ];
    
    // Si l'utilisateur est un employé, ne montrer que ses tâches (simuler avec l'ID 4)
    const filteredTasks = isEmployee 
      ? mockTasks.filter(task => task.employe_id === 4)
      : mockTasks;
    
    setTasks(filteredTasks);
    setProjects(mockProjects);
    setEmployees(mockEmployees);
    setLoading(false);
  };
  
  const filteredTasks = tasks.filter(task => 
    task.nom.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (activeTab === 'all' 
      || (activeTab === 'not-started' && task.statut === 'Non commencé')
      || (activeTab === 'in-progress' && task.statut === 'En cours')
      || (activeTab === 'completed' && task.statut === 'Terminé')
    )
  );

  const handleCreateTask = async (formData: any) => {
    try {
      if (apiAvailable) {
        const response = await taskService.create(formData);
        // Ajouter la tâche avec projets et employés appropriés
        const newTask = response.task;
        const project = projects.find(p => p.id === newTask.projet_id);
        const employee = formData.employe_id ? employees.find(e => e.id === newTask.employe_id) : null;
        setTasks([...tasks, {
          ...newTask,
          projet_nom: project?.nom,
          employe_nom: employee?.nom,
          employe_prenom: employee?.prenom
        }]);
      } else {
        // Simulation en mode développement
        const project = projects.find(p => p.id === formData.projet_id);
        const employee = formData.employe_id ? employees.find(e => e.id === formData.employe_id) : null;
        const newTask = {
          id: tasks.length + 1,
          nom: formData.nom,
          description: formData.description,
          projet_id: formData.projet_id,
          projet_nom: project?.nom,
          employe_id: formData.employe_id,
          employe_nom: employee?.nom,
          employe_prenom: employee?.prenom,
          statut: formData.statut,
          date_debut: formData.date_debut,
          date_fin: formData.date_fin
        };
        setTasks([...tasks, newTask]);
      }
      toast.success("Tâche créée avec succès");
      setOpenDialog(false);
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error("Erreur lors de la création de la tâche");
      throw error;
    }
  };

  const handleUpdateTask = async (formData: any) => {
    try {
      if (!currentTask) return;
      
      if (apiAvailable) {
        const response = await taskService.update(currentTask.id, formData);
        // Mettre à jour la tâche avec projets et employés appropriés
        const updatedTask = response.task;
        const project = projects.find(p => p.id === updatedTask.projet_id);
        const employee = formData.employe_id ? employees.find(e => e.id === updatedTask.employe_id) : null;
        setTasks(tasks.map(t => t.id === currentTask.id ? {
          ...updatedTask,
          projet_nom: project?.nom,
          employe_nom: employee?.nom,
          employe_prenom: employee?.prenom
        } : t));
      } else {
        // Simulation en mode développement
        const project = projects.find(p => p.id === formData.projet_id);
        const employee = formData.employe_id ? employees.find(e => e.id === formData.employe_id) : null;
        setTasks(tasks.map(t => t.id === currentTask.id ? {
          ...t,
          nom: formData.nom,
          description: formData.description,
          projet_id: formData.projet_id,
          projet_nom: project?.nom,
          employe_id: formData.employe_id,
          employe_nom: employee?.nom,
          employe_prenom: employee?.prenom,
          statut: formData.statut,
          date_debut: formData.date_debut,
          date_fin: formData.date_fin
        } : t));
      }
      
      toast.success("Tâche mise à jour avec succès");
      setOpenDialog(false);
      setCurrentTask(null);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error("Erreur lors de la mise à jour de la tâche");
      throw error;
    }
  };

  const handleUpdateStatus = async (taskId: number, newStatus: TaskStatus) => {
    try {
      if (apiAvailable) {
        await taskService.updateStatus(taskId, newStatus);
      }
      
      // Mise à jour de l'UI
      setTasks(tasks.map(t => t.id === taskId ? { ...t, statut: newStatus } : t));
      toast.success(`Statut mis à jour: ${newStatus}`);
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const handleDelete = (id: number) => {
    setTaskToDelete(id);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    
    try {
      setLoading(true);
      if (apiAvailable) {
        await taskService.delete(taskToDelete);
      }
      
      // Mise à jour de l'UI
      setTasks(tasks.filter(t => t.id !== taskToDelete));
      toast.success("Tâche supprimée avec succès");
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error("Erreur lors de la suppression de la tâche");
    } finally {
      setLoading(false);
      setTaskToDelete(null);
    }
  };

  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setIsEditMode(true);
    setOpenDialog(true);
  };

  const handleOpenDialog = () => {
    setIsEditMode(false);
    setCurrentTask(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentTask(null);
    setIsEditMode(false);
  };

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
                <Button onClick={handleOpenDialog}>
                  <Plus className="mr-2 h-4 w-4" /> Nouvelle tâche
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {isEditMode ? "Modifier la tâche" : "Ajouter une nouvelle tâche"}
                    </DialogTitle>
                  </DialogHeader>
                  <TaskForm
                    initialData={currentTask || undefined}
                    onSubmit={isEditMode ? handleUpdateTask : handleCreateTask}
                    onCancel={handleCloseDialog}
                    projects={projects}
                    employees={employees}
                  />
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
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onEdit={canCreateTask ? () => handleEditTask(task) : undefined}
                  onDelete={canCreateTask ? () => handleDelete(task.id) : undefined}
                  onStatusChange={handleUpdateStatus}
                  projectName={task.projet_nom}
                  assignee={task.employe_nom && task.employe_prenom 
                    ? `${task.employe_prenom} ${task.employe_nom}` 
                    : undefined}
                />
              ))}
              
              {filteredTasks.length === 0 && (
                <div className="col-span-3 text-center py-12">
                  <p className="text-muted-foreground">Aucune tâche trouvée</p>
                  {searchTerm && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Essayez d'utiliser des termes de recherche différents
                    </p>
                  )}
                  {!searchTerm && activeTab !== 'all' && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Aucune tâche avec ce statut
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <AlertDialog open={taskToDelete !== null} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette tâche?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La tâche sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Tasks;
