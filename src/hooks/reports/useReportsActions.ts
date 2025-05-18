
import { Dispatch, SetStateAction } from 'react';
import { reportService } from '@/services/api';
import { Report } from '@/types';
import { toast } from 'sonner';

interface UseReportsActionsProps {
  reports: Report[];
  setReports: Dispatch<SetStateAction<Report[]>>;
  canCreateReport: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export const useReportsActions = ({
  reports,
  setReports,
  canCreateReport,
  setLoading
}: UseReportsActionsProps) => {
  
  const createReport = async (formData: any) => {
    if (!canCreateReport) {
      toast.error('Vous n\'avez pas les permissions pour créer un rapport');
      return false;
    }
    
    try {
      setLoading(true);
      const response = await reportService.create(formData);
      
      if (response.report) {
        setReports([...reports, response.report]);
        toast.success('Rapport créé avec succès');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error('Erreur lors de la création du rapport');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const updateReport = async (reportId: number, formData: any) => {
    try {
      setLoading(true);
      const response = await reportService.update(reportId, formData);
      
      if (response.report) {
        setReports(reports.map(r => r.id === reportId ? response.report : r));
        toast.success('Rapport mis à jour avec succès');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Erreur lors de la mise à jour du rapport');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const deleteReport = async (reportId: number) => {
    try {
      setLoading(true);
      await reportService.delete(reportId);
      setReports(reports.filter(r => r.id !== reportId));
      toast.success('Rapport supprimé avec succès');
      return true;
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Erreur lors de la suppression du rapport');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    createReport,
    updateReport,
    deleteReport
  };
};
