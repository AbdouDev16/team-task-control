
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

interface DeleteReportDialogProps {
  reportToDelete: number | null;
  setReportToDelete: React.Dispatch<React.SetStateAction<number | null>>;
  confirmDelete: () => Promise<void>;
}

const DeleteReportDialog = ({
  reportToDelete,
  setReportToDelete,
  confirmDelete,
}: DeleteReportDialogProps) => {
  return (
    <AlertDialog 
      open={reportToDelete !== null} 
      onOpenChange={(open) => !open && setReportToDelete(null)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce rapport?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Le rapport sera définitivement supprimé.
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

export default DeleteReportDialog;
