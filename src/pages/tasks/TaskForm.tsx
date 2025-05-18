
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Task, TaskStatus } from '@/types';
import FormWrapper from '@/components/forms/FormWrapper';
import { toast } from 'sonner';

interface TaskFormData {
  nom: string;
  description: string;
  projet_id: number;
  employe_id?: number | null;
  statut: TaskStatus;
  date_debut: string;
  date_fin: string;
}

interface TaskFormProps {
  initialData?: Partial<Task>;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
  projects: { id: number; nom: string }[];
  employees: { id: number; nom: string; prenom: string }[];
  selectedProjectId?: number;
}

const TaskForm = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  projects, 
  employees,
  selectedProjectId 
}: TaskFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({
    nom: initialData?.nom || '',
    description: initialData?.description || '',
    projet_id: selectedProjectId || initialData?.projet_id || 0,
    employe_id: initialData?.employe_id || null,
    statut: initialData?.statut || 'Non commencé',
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

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'projet_id' || name === 'employe_id') {
      setFormData({
        ...formData,
        [name]: value ? parseInt(value) : null
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom) {
      toast.error("Le nom de la tâche est requis");
      return;
    }
    
    if (!formData.projet_id) {
      toast.error("Le projet est requis");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error('Error submitting task form:', error);
      toast.error("Une erreur s'est produite lors de l'enregistrement de la tâche");
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
          <Label htmlFor="nom">Nom de la tâche</Label>
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
          <Label htmlFor="projet_id">Projet</Label>
          <Select 
            value={formData.projet_id ? formData.projet_id.toString() : ''} 
            onValueChange={(value) => handleSelectChange('projet_id', value)}
            disabled={!!selectedProjectId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un projet" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="employe_id">Assigné à</Label>
          <Select 
            value={formData.employe_id ? formData.employe_id.toString() : ''} 
            onValueChange={(value) => handleSelectChange('employe_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un employé" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Non assigné</SelectItem>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id.toString()}>
                  {employee.prenom} {employee.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="statut">Statut</Label>
          <Select 
            value={formData.statut} 
            onValueChange={(value) => handleSelectChange('statut', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Non commencé">Non commencé</SelectItem>
              <SelectItem value="En cours">En cours</SelectItem>
              <SelectItem value="Terminé">Terminé</SelectItem>
              <SelectItem value="En retard">En retard</SelectItem>
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
          <Label htmlFor="date_fin">Date d'échéance</Label>
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

export default TaskForm;
