
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Project } from '@/types';
import FormWrapper from './FormWrapper';
import { toast } from 'sonner';

interface ProjectFormData {
  nom: string;
  description: string;
  chef_projet_id: number;
  date_debut: string;
  date_fin: string;
}

interface ProjectFormProps {
  initialData?: Partial<Project>;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel: () => void;
  projectManagers: { id: number; nom: string; prenom: string }[];
}

const ProjectForm = ({ initialData, onSubmit, onCancel, projectManagers }: ProjectFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    nom: initialData?.nom || '',
    description: initialData?.description || '',
    chef_projet_id: initialData?.chef_projet_id || 0,
    date_debut: initialData?.date_debut ? initialData.date_debut.substring(0, 10) : '',
    date_fin: initialData?.date_fin ? initialData.date_fin.substring(0, 10) : ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleManagerChange = (value: string) => {
    setFormData({
      ...formData,
      chef_projet_id: parseInt(value)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom) {
      toast.error("Le nom du projet est requis");
      return;
    }
    
    if (!formData.chef_projet_id) {
      toast.error("Le chef de projet est requis");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error('Error submitting project form:', error);
      toast.error("Une erreur s'est produite lors de l'enregistrement du projet");
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
          <Label htmlFor="nom">Nom du projet</Label>
          <Input
            id="nom"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="chef_projet_id">Chef de projet</Label>
          <Select 
            value={formData.chef_projet_id ? formData.chef_projet_id.toString() : ''} 
            onValueChange={handleManagerChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un chef de projet" />
            </SelectTrigger>
            <SelectContent>
              {projectManagers.map((manager) => (
                <SelectItem key={manager.id} value={manager.id.toString()}>
                  {manager.prenom} {manager.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="date_debut">Date de début</Label>
          <Input
            id="date_debut"
            name="date_debut"
            type="date"
            value={formData.date_debut}
            onChange={handleChange}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="date_fin">Date de fin prévue</Label>
          <Input
            id="date_fin"
            name="date_fin"
            type="date"
            value={formData.date_fin}
            onChange={handleChange}
          />
        </div>
      </div>
    </FormWrapper>
  );
};

export default ProjectForm;
