
import React, { useState } from 'react';
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
  Users as UsersIcon
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserRole } from '@/types';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Mock data
const mockUsers = [
  { id: 1, username: 'admin', role: 'Admin' as UserRole, nom: 'Admin', prenom: 'System' },
  { id: 2, username: 'manager1', role: 'Gérant' as UserRole, nom: 'Dubois', prenom: 'Marie' },
  { id: 3, username: 'manager2', role: 'Gérant' as UserRole, nom: 'Martin', prenom: 'Lucas' },
  { id: 4, username: 'pm1', role: 'Chef_Projet' as UserRole, nom: 'Bernard', prenom: 'Sophie' },
  { id: 5, username: 'pm2', role: 'Chef_Projet' as UserRole, nom: 'Petit', prenom: 'Antoine' },
  { id: 6, username: 'employee1', role: 'Employé' as UserRole, nom: 'Durand', prenom: 'Emma' },
  { id: 7, username: 'employee2', role: 'Employé' as UserRole, nom: 'Leroy', prenom: 'Thomas' },
  { id: 8, username: 'employee3', role: 'Employé' as UserRole, nom: 'Moreau', prenom: 'Julie' },
];

const Users = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  
  const isAdmin = user?.role === 'Admin';

  // Filter users based on search and active tab
  const filteredUsers = mockUsers.filter(u => {
    // Search filter
    const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.prenom.toLowerCase().includes(searchTerm.toLowerCase());
    
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
  
  const handleEdit = (id: number) => {
    toast.info(`Édition de l'utilisateur ID: ${id} - Fonctionnalité à implémenter`);
  };
  
  const handleDelete = (id: number) => {
    toast.info(`Suppression de l'utilisateur ID: ${id} - Fonctionnalité à implémenter`);
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
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Nouvel utilisateur
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
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
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.nom}</TableCell>
                    <TableCell>{user.prenom}</TableCell>
                    <TableCell>
                      <Badge className={roleBadgeClasses[user.role]} variant="outline">
                        <span className="flex items-center gap-1">
                          {roleIcons[user.role]} {user.role}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(user.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(user.id)}
                          disabled={!isAdmin && user.role === 'Admin'}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
