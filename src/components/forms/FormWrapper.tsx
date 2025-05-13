
import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

interface FormWrapperProps {
  children: ReactNode;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitText?: string;
  cancelText?: string;
}

const FormWrapper = ({ 
  children, 
  isSubmitting, 
  onSubmit, 
  onCancel, 
  submitText = "Enregistrer", 
  cancelText = "Annuler" 
}: FormWrapperProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {children}
      <DialogFooter className="gap-2 sm:space-x-0">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {cancelText}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Traitement..." : submitText}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default FormWrapper;
