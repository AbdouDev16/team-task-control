
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useReportsData } from './useReportsData';
import { useReportsActions } from './useReportsActions';

export const useReportsService = () => {
  const { user, apiAvailable } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const canCreateReport = user?.role === 'Chef_Projet';

  const {
    reports,
    setReports,
    loadReports
  } = useReportsData(apiAvailable);

  const {
    createReport,
    updateReport,
    deleteReport
  } = useReportsActions({
    reports,
    setReports,
    canCreateReport,
    setLoading,
    apiAvailable
  });

  useEffect(() => {
    loadReports();
  }, [user, apiAvailable]);

  return {
    reports,
    loading,
    canCreateReport,
    createReport,
    updateReport,
    deleteReport
  };
};
