
import React from 'react';
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

interface DeleteTaskDialogProps {
  taskToDelete: number | null;
  setTaskToDelete: (id: number | null) => void;
  confirmDelete: () => void;
}

const DeleteTaskDialog: React.FC<DeleteTaskDialogProps> = ({
  taskToDelete,
  setTaskToDelete,
  confirmDelete
}) => {
  return (
    <AlertDialog 
      open={taskToDelete !== null} 
      onOpenChange={(open) => !open && setTaskToDelete(null)}
    >
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
  );
};

export default DeleteTaskDialog;
