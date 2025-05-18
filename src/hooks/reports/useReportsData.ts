
import { useState } from 'react';
import { Report } from '@/types';
import { reportService } from '@/services/api';
import { toast } from 'sonner';

export const useReportsData = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await reportService.getAll();
      
      if (response.reports) {
        setReports(response.reports);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
      toast.error('Impossible de charger les rapports. Veuillez réessayer.');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    reports,
    setReports,
    loading,
    setLoading,
    loadReports
  };
};
