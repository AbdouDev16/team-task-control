
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Search,
  Edit,
  Trash2,
  User,
  UserCog,
  Users as UsersIcon,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserRole, User } from '@/types';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import UserForm from '@/components/forms/UserForm';
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
import { userService } from '@/services/api';

interface UserWithDetails extends User {
  nom?: string;
  prenom?: string;
}

const Users = () => {
  const { user, apiAvailable } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserWithDetails | null>(null);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    if (apiAvailable) {
      loadUsers();
    } else {
      loadMockUsers();
    }
  }, [apiAvailable]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll();
      if (response.users) {
        const formattedUsers = response.users.map((u: any) => ({
          id: u.id,
          username: u.username,
          role: u.role,
          nom: u.details?.nom || '',
          prenom: u.details?.prenom || '',
          details: u.details || {}
        }));
        setUsers(formattedUsers);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Impossible de charger les utilisateurs');
      setLoading(false);
      loadMockUsers();
    }
  };

  const loadMockUsers = () => {
    // Utilisation des données mockées pour le développement
    const mockUsers = [
      { id: 1, username: 'admin', role: 'Admin' as UserRole, nom: 'Admin', prenom: 'System', details: { nom: 'Admin', prenom: 'System' } },
      { id: 2, username: 'manager1', role: 'Gérant' as UserRole, nom: 'Dubois', prenom: 'Marie', details: { nom: 'Dubois', prenom: 'Marie' } },
      { id: 3, username: 'manager2', role: 'Gérant' as UserRole, nom: 'Martin', prenom: 'Lucas', details: { nom: 'Martin', prenom: 'Lucas' } },
      { id: 4, username: 'pm1', role: 'Chef_Projet' as UserRole, nom: 'Bernard', prenom: 'Sophie', details: { nom: 'Bernard', prenom: 'Sophie' } },
      { id: 5, username: 'pm2', role: 'Chef_Projet' as UserRole, nom: 'Petit', prenom: 'Antoine', details: { nom: 'Petit', prenom: 'Antoine' } },
      { id: 6, username: 'employee1', role: 'Employé' as UserRole, nom: 'Durand', prenom: 'Emma', details: { nom: 'Durand', prenom: 'Emma' } },
      { id: 7, username: 'employee2', role: 'Employé' as UserRole, nom: 'Leroy', prenom: 'Thomas', details: { nom: 'Leroy', prenom: 'Thomas' } },
      { id: 8, username: 'employee3', role: 'Employé' as UserRole, nom: 'Moreau', prenom: 'Julie', details: { nom: 'Moreau', prenom: 'Julie' } },
    ];
    setUsers(mockUsers);
    setLoading(false);
  };

  // Filter users based on search and active tab
  const filteredUsers = users.filter(u => {
    // Search filter
    const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.prenom || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Tab filter
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'managers' && u.role === 'Gérant') || 
                      (activeTab === 'project-managers' && u.role === 'Chef_Projet') ||
                      (activeTab === 'employees' && u.role === 'Employé');
                      
    return matchesSearch && matchesTab;
  });
  
  const roleIcons = {
    'Admin': <UserCog size={16} />,
    'Gérant': <UserCog size={16} />,
    'Chef_Projet': <User size={16} />,
    'Employé': <User size={16} />
  };
  
  const roleBadgeClasses = {
    'Admin': 'bg-project-red text-white',
    'Gérant': 'bg-project-purple text-white',
    'Chef_Projet': 'bg-project-blue text-white',
    'Employé': 'bg-project-green text-white'
  };
  
  const handleEdit = (userData: UserWithDetails) => {
    setCurrentUser(userData);
    setIsEditMode(true);
    setOpenDialog(true);
  };
  
  const handleDelete = (id: number) => {
    setUserToDelete(id);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      setLoading(true);
      if (apiAvailable) {
        await userService.delete(userToDelete);
      }
      
      // Mise à jour de l'UI
      setUsers(users.filter(u => u.id !== userToDelete));
      toast.success("Utilisateur supprimé avec succès");
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error("Erreur lors de la suppression de l'utilisateur");
    } finally {
      setLoading(false);
      setUserToDelete(null);
    }
  };
  
  const handleCreateUser = async (formData: any) => {
    try {
      if (apiAvailable) {
        const response = await userService.create(formData);
        // Ajouter l'utilisateur avec détails appropriés
        const newUser = response.user;
        setUsers([...users, {
          ...newUser,
          nom: formData.details.nom,
          prenom: formData.details.prenom
        }]);
      } else {
        // Simulation en mode développement
        const newUser = {
          id: users.length + 1,
          username: formData.username,
          role: formData.role,
          nom: formData.details.nom,
          prenom: formData.details.prenom,
          details: {
            nom: formData.details.nom,
            prenom: formData.details.prenom
          }
        };
        setUsers([...users, newUser]);
      }
      toast.success("Utilisateur créé avec succès");
      setOpenDialog(false);
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error("Erreur lors de la création de l'utilisateur");
      throw error;
    }
  };
  
  const handleUpdateUser = async (formData: any) => {
    try {
      if (!currentUser) return;
      
      if (apiAvailable) {
        const response = await userService.update(currentUser.id, formData);
        // Mettre à jour l'utilisateur avec détails appropriés
        const updatedUser = response.user;
        setUsers(users.map(u => u.id === currentUser.id ? {
          ...updatedUser,
          nom: formData.details.nom,
          prenom: formData.details.prenom
        } : u));
      } else {
        // Simulation en mode développement
        setUsers(users.map(u => u.id === currentUser.id ? {
          ...u,
          username: formData.username,
          role: formData.role,
          nom: formData.details.nom,
          prenom: formData.details.prenom,
          details: {
            ...u.details,
            nom: formData.details.nom,
            prenom: formData.details.prenom
          }
        } : u));
      }
      
      toast.success("Utilisateur mis à jour avec succès");
      setOpenDialog(false);
      setCurrentUser(null);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error("Erreur lors de la mise à jour de l'utilisateur");
      throw error;
    }
  };

  const handleOpenDialog = () => {
    setIsEditMode(false);
    setCurrentUser(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentUser(null);
    setIsEditMode(false);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Utilisateurs" />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Gestion des utilisateurs</h1>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenDialog}>
                  <Plus className="mr-2 h-4 w-4" /> Nouvel utilisateur
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {isEditMode ? "Modifier l'utilisateur" : "Ajouter un nouvel utilisateur"}
                  </DialogTitle>
                </DialogHeader>
                <UserForm
                  initialData={currentUser || undefined}
                  onSubmit={isEditMode ? handleUpdateUser : handleCreateUser}
                  onCancel={handleCloseDialog}
                  isEdit={isEditMode}
                />
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Rechercher un utilisateur..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Tabs 
            defaultValue="all" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="mb-6"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="flex gap-2 items-center">
                <UsersIcon size={14} /> Tous
              </TabsTrigger>
              <TabsTrigger value="managers" className="flex gap-2 items-center">
                <UserCog size={14} /> Gérants
              </TabsTrigger>
              <TabsTrigger value="project-managers" className="flex gap-2 items-center">
                <User size={14} /> Chefs de projet
              </TabsTrigger>
              <TabsTrigger value="employees" className="flex gap-2 items-center">
                <User size={14} /> Employés
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Nom d'utilisateur</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prénom</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.id}</TableCell>
                      <TableCell>{u.username}</TableCell>
                      <TableCell>{u.nom}</TableCell>
                      <TableCell>{u.prenom}</TableCell>
                      <TableCell>
                        <Badge className={roleBadgeClasses[u.role]} variant="outline">
                          <span className="flex items-center gap-1">
                            {roleIcons[u.role]} {u.role}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(u)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDelete(u.id)}
                            disabled={(!isAdmin && u.role === 'Admin') || user?.id === u.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        Aucun utilisateur trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
      
      <AlertDialog open={userToDelete !== null} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet utilisateur?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'utilisateur et toutes ses données associées seront définitivement supprimés.
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

export default Users;
