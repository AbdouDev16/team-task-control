
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Report } from '@/types';
import FormWrapper from './FormWrapper';
import { toast } from 'sonner';

interface ReportFormData {
  titre: string;
  contenu: string;
}

interface ReportFormProps {
  initialData?: Partial<Report>;
  onSubmit: (data: ReportFormData) => Promise<void>;
  onCancel: () => void;
}

const ReportForm = ({ initialData, onSubmit, onCancel }: ReportFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ReportFormData>({
    titre: initialData?.titre || '',
    contenu: initialData?.contenu || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titre) {
      toast.error("Le titre du rapport est requis");
      return;
    }
    
    if (!formData.contenu) {
      toast.error("Le contenu du rapport est requis");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error('Error submitting report form:', error);
      toast.error("Une erreur s'est produite lors de l'enregistrement du rapport");
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
          <Label htmlFor="titre">Titre du rapport</Label>
          <Input
            id="titre"
            name="titre"
            value={formData.titre}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="contenu">Contenu</Label>
          <Textarea
            id="contenu"
            name="contenu"
            value={formData.contenu}
            onChange={handleChange}
            rows={10}
            required
          />
        </div>
      </div>
    </FormWrapper>
  );
};

export default ReportForm;
