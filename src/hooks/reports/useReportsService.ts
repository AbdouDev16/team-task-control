
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Report } from '@/types';
import { reportService } from '@/services/api';
import { toast } from 'sonner';

export const useReportsService = () => {
  const { user, apiAvailable } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isProjectManager = user?.role === 'Chef_Projet';
  const isManagerOrAdmin = user?.role === 'Gérant' || user?.role === 'Admin';
  const canCreateReports = isProjectManager || isManagerOrAdmin;

  useEffect(() => {
    loadReports();
  }, [apiAvailable]);

  const loadReports = async () => {
    try {
      setLoading(true);
      if (apiAvailable) {
        const response = await reportService.getAll();
        if (response.reports) {
          setReports(response.reports);
        } else {
          setReports([]);
        }
      } else {
        // Utilisation des données mockées pour le développement
        loadMockReports();
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
      toast.error('Impossible de charger les rapports');
      loadMockReports();
    } finally {
      setLoading(false);
    }
  };

  const loadMockReports = () => {
    const mockReports = [
      {
        id: 1,
        titre: 'Rapport d\'avancement CRM',
        contenu: 'Le projet CRM avance selon le planning prévu. La phase de conception de la base de données est terminée.',
        date_creation: '2025-05-05T14:30:00',
        chef_projet_id: 1
      },
      {
        id: 2,
        titre: 'Tests de performance mobile',
        contenu: 'Les tests de performance de l\'application mobile montrent des résultats satisfaisants. Quelques optimisations sont nécessaires.',
        date_creation: '2025-05-03T10:15:00',
        chef_projet_id: 2
      },
      {
        id: 3,
        titre: 'Revue de code mensuelle',
        contenu: 'La revue de code du mois de mai a révélé quelques problèmes de sécurité mineurs qui ont été corrigés.',
        date_creation: '2025-05-01T16:45:00',
        chef_projet_id: 1
      }
    ];
    setReports(mockReports);
  };

  const createReport = async (formData: any) => {
    try {
      setLoading(true);
      if (apiAvailable) {
        const response = await reportService.create(formData);
        setReports([...reports, response.report]);
        toast.success("Rapport créé avec succès");
        return true;
      } else {
        // Simulation en mode développement
        const newReport = {
          id: reports.length + 1,
          titre: formData.titre,
          contenu: formData.contenu,
          date_creation: new Date().toISOString(),
          chef_projet_id: user?.id || 1
        };
        setReports([...reports, newReport]);
        toast.success("Rapport créé avec succès");
        return true;
      }
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error("Erreur lors de la création du rapport");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateReport = async (id: number, formData: any) => {
    try {
      setLoading(true);
      if (apiAvailable) {
        const response = await reportService.update(id, formData);
        setReports(reports.map(r => r.id === id ? response.report : r));
      } else {
        setReports(reports.map(r => r.id === id ? {
          ...r,
          titre: formData.titre,
          contenu: formData.contenu
        } : r));
      }
      toast.success("Rapport mis à jour avec succès");
      return true;
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error("Erreur lors de la mise à jour du rapport");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (id: number) => {
    try {
      setLoading(true);
      if (apiAvailable) {
        await reportService.delete(id);
      }
      setReports(reports.filter(r => r.id !== id));
      toast.success("Rapport supprimé avec succès");
      return true;
    } catch (error) {
      console.error('Failed to delete report:', error);
      toast.error("Erreur lors de la suppression du rapport");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return {
    reports,
    loading,
    isProjectManager,
    isManagerOrAdmin,
    canCreateReports,
    createReport,
    updateReport,
    deleteReport,
    formatDate,
    userId: user?.id
  };
};
