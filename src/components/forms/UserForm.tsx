
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole, User } from '@/types';
import FormWrapper from './FormWrapper';
import { toast } from 'sonner';

interface UserFormData {
  username: string;
  password: string;
  role: UserRole;
  details: {
    nom: string;
    prenom: string;
  };
}

interface UserFormProps {
  initialData?: Partial<User>;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

const UserForm = ({ initialData, onSubmit, onCancel, isEdit = false }: UserFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    username: initialData?.username || '',
    password: '',
    role: initialData?.role || 'Employé',
    details: {
      nom: initialData?.details?.nom || '',
      prenom: initialData?.details?.prenom || ''
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'nom' || name === 'prenom') {
      setFormData({
        ...formData,
        details: {
          ...formData.details,
          [name]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value as UserRole
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username) {
      toast.error("Le nom d'utilisateur est requis");
      return;
    }
    
    if (!isEdit && !formData.password) {
      toast.error("Le mot de passe est requis");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error('Error submitting user form:', error);
      toast.error("Une erreur s'est produite lors de l'enregistrement de l'utilisateur");
    }
  };

  return (
    <FormWrapper 
      isSubmitting={isSubmitting} 
      onSubmit={handleSubmit} 
      onCancel={onCancel}
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="username">Nom d'utilisateur</Label>
          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        
        {!isEdit && (
          <div className="grid gap-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required={!isEdit}
            />
          </div>
        )}
        
        {isEdit && (
          <div className="grid gap-2">
            <Label htmlFor="password">Nouveau mot de passe (laisser vide pour ne pas changer)</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required={false}
            />
          </div>
        )}
        
        <div className="grid gap-2">
          <Label htmlFor="role">Rôle</Label>
          <Select 
            value={formData.role} 
            onValueChange={handleRoleChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Admin">Administrateur</SelectItem>
              <SelectItem value="Gérant">Gérant</SelectItem>
              <SelectItem value="Chef_Projet">Chef de projet</SelectItem>
              <SelectItem value="Employé">Employé</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="nom">Nom</Label>
          <Input
            id="nom"
            name="nom"
            value={formData.details.nom}
            onChange={handleChange}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="prenom">Prénom</Label>
          <Input
            id="prenom"
            name="prenom"
            value={formData.details.prenom}
            onChange={handleChange}
          />
        </div>
      </div>
    </FormWrapper>
  );
};

export default UserForm;
