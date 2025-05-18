
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { User, UserRole } from '@/types';
import { Search, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Users = () => {
  const { apiAvailable } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (apiAvailable) {
      loadUsers();
    }
  }, [apiAvailable]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll();
      if (response.users) {
        setUsers(response.users);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await userService.delete(userId);
        toast.success('Utilisateur supprimé avec succès');
        loadUsers(); // Reload users after deletion
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Erreur lors de la suppression de l\'utilisateur');
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.details?.nom && user.details.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.details?.prenom && user.details.prenom.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'Admin': return 'destructive';
      case 'Gérant': return 'default'; // Changed from 'warning' to 'default'
      case 'Chef_Projet': return 'default';
      case 'Employé': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Gestion des utilisateurs" />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Utilisateurs</h2>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un utilisateur
            </Button>
          </div>
          
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <Input
              className="pl-10"
              placeholder="Rechercher par nom, prénom, nom d'utilisateur ou rôle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 text-center">Chargement des utilisateurs...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-6 text-center">Aucun utilisateur trouvé</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
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
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.details?.nom || '-'}</TableCell>
                        <TableCell>{user.details?.prenom || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role as UserRole)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="text-destructive" 
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Users;
