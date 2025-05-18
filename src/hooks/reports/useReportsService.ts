
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useReportsData } from './useReportsData';
import { useReportsActions } from './useReportsActions';

export const useReportsService = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Seuls les chefs de projet peuvent créer des rapports
  const canCreateReport = user?.role === 'Chef_Projet';
  
  // Admin, Gérants et Chefs de projet peuvent voir les rapports
  const canViewReports = ['Admin', 'Gérant', 'Chef_Projet'].includes(user?.role || '');

  const {
    reports,
    setReports,
    loadReports
  } = useReportsData();

  const {
    createReport,
    updateReport,
    deleteReport
  } = useReportsActions({
    reports,
    setReports,
    canCreateReport,
    setLoading
  });

  useEffect(() => {
    if (canViewReports) {
      loadReports();
    }
  }, [user, canViewReports]);

  return {
    reports,
    loading,
    canCreateReport,
    canViewReports,
    createReport,
    updateReport,
    deleteReport
  };
};
