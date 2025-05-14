
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

interface DeleteProjectDialogProps {
  projectId: number | null;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteProjectDialog: React.FC<DeleteProjectDialogProps> = ({
  projectId,
  onClose,
  onConfirm
}) => {
  const open = projectId !== null;

  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce projet?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Le projet et toutes ses tâches associées seront définitivement supprimés.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground">
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteProjectDialog;
