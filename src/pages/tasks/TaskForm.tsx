
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskStatus } from '@/types';

interface Employee {
  id: number;
  nom: string;
  prenom: string;
}

interface Project {
  id: number;
  nom: string;
}

interface TaskFormData {
  nom: string;
  description: string;
  projet_id: number;
  employe_id: number;
  statut: TaskStatus;
  date_debut: string;
  date_fin: string;
}

interface TaskFormProps {
  initialData?: Partial<TaskFormData>;
  employees: Employee[];
  projects: Project[];
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
}

const TaskForm = ({ initialData, employees, projects, onSubmit, onCancel }: TaskFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({
    nom: initialData?.nom || '',
    description: initialData?.description || '',
    projet_id: initialData?.projet_id || 0,
    employe_id: initialData?.employe_id || 0,
    statut: initialData?.statut || 'Non commencé',
    date_debut: initialData?.date_debut || '',
    date_fin: initialData?.date_fin || '',
  });

  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.date_debut ? new Date(initialData.date_debut) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData?.date_fin ? new Date(initialData.date_fin) : undefined
  );

  // Status options
  const taskStatusOptions: TaskStatus[] = ['Non commencé', 'En cours', 'Terminé', 'En retard'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: name === 'statut' ? value : Number(value)
    });
  };

  useEffect(() => {
    if (startDate) {
      setFormData(prev => ({
        ...prev,
        date_debut: format(startDate, 'yyyy-MM-dd')
      }));
    }
  }, [startDate]);

  useEffect(() => {
    if (endDate) {
      setFormData(prev => ({
        ...prev,
        date_fin: format(endDate, 'yyyy-MM-dd')
      }));
    }
  }, [endDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.nom || !formData.projet_id || !formData.employe_id) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Une erreur est survenue lors de l\'enregistrement de la tâche');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="nom">Nom de la tâche *</Label>
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
          <Label htmlFor="projet_id">Projet *</Label>
          <Select 
            value={formData.projet_id.toString()} 
            onValueChange={(value) => handleSelectChange('projet_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un projet" />
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
          <Label htmlFor="employe_id">Assignée à *</Label>
          <Select 
            value={formData.employe_id.toString()} 
            onValueChange={(value) => handleSelectChange('employe_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un employé" />
            </SelectTrigger>
            <SelectContent>
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
            onValueChange={(value) => handleSelectChange('statut', value as TaskStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              {taskStatusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="date_debut">Date de début</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP", { locale: fr }) : "Sélectionner"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="date_fin">Date d'échéance</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP", { locale: fr }) : "Sélectionner"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  locale={fr}
                  disabled={(date) => 
                    startDate ? date < startDate : false
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : initialData?.id ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
