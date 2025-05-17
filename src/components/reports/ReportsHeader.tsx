
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ReportForm from '@/components/forms/ReportForm';
import { Report } from '@/types';

interface ReportsHeaderProps {
  title: string;
  openDialog: boolean;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  isEditMode: boolean;
  currentReport: Report | null;
  handleOpenDialog: () => void;
  handleCreateReport: (formData: any) => Promise<void>;
  handleUpdateReport: (formData: any) => Promise<void>;
  handleCloseDialog: () => void;
  canCreateReports: boolean;
}

const ReportsHeader = ({
  title,
  openDialog,
  setOpenDialog,
  isEditMode,
  currentReport,
  handleOpenDialog,
  handleCreateReport,
  handleUpdateReport,
  handleCloseDialog,
  canCreateReports,
}: ReportsHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      {canCreateReports && (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <Button onClick={handleOpenDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouveau rapport
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? "Modifier le rapport" : "Créer un nouveau rapport"}
              </DialogTitle>
            </DialogHeader>
            <ReportForm 
              initialData={currentReport || undefined}
              onSubmit={isEditMode ? handleUpdateReport : handleCreateReport}
              onCancel={handleCloseDialog}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ReportsHeader;
