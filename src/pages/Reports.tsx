
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { reportService } from '@/services/api';
import { toast } from 'sonner';
import { Report } from '@/types';
import { 
  ReportsHeader, 
  ReportsSearch, 
  ReportsList, 
  DeleteReportDialog 
} from '@/components/reports';

const Reports = () => {
  const { user, apiAvailable } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [reportToDelete, setReportToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const isProjectManager = user?.role === 'Chef_Projet';
  const isManagerOrAdmin = user?.role === 'Gérant' || user?.role === 'Admin';
  const canCreateReports = isProjectManager || isManagerOrAdmin;

  useEffect(() => {
    if (apiAvailable) {
      loadReports();
    } else {
      loadMockReports();
    }
  }, [apiAvailable]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await reportService.getAll();
      if (response.reports) {
        setReports(response.reports);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load reports:', error);
      toast.error('Impossible de charger les rapports');
      setLoading(false);
      loadMockReports();
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
    setLoading(false);
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

  const handleCreateReport = async (formData: any) => {
    try {
      if (apiAvailable) {
        const response = await reportService.create(formData);
        // Ajouter le rapport
        setReports([...reports, response.report]);
      } else {
        // Simulation en mode développement
        const now = new Date();
        const newReport = {
          id: reports.length + 1,
          titre: formData.titre,
          contenu: formData.contenu,
          date_creation: now.toISOString(),
          chef_projet_id: user?.id || 1
        };
        setReports([...reports, newReport]);
      }
      toast.success("Rapport créé avec succès");
      setOpenDialog(false);
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error("Erreur lors de la création du rapport");
      throw error;
    }
  };

  const handleUpdateReport = async (formData: any) => {
    try {
      if (!currentReport) return;
      
      if (apiAvailable) {
        const response = await reportService.update(currentReport.id, formData);
        // Mettre à jour le rapport
        setReports(reports.map(r => r.id === currentReport.id ? response.report : r));
      } else {
        // Simulation en mode développement
        setReports(reports.map(r => r.id === currentReport.id ? {
          ...r,
          titre: formData.titre,
          contenu: formData.contenu
        } : r));
      }
      
      toast.success("Rapport mis à jour avec succès");
      setOpenDialog(false);
      setCurrentReport(null);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error("Erreur lors de la mise à jour du rapport");
      throw error;
    }
  };

  const handleDelete = (id: number) => {
    setReportToDelete(id);
  };

  const confirmDelete = async () => {
    if (!reportToDelete) return;
    
    try {
      setLoading(true);
      if (apiAvailable) {
        await reportService.delete(reportToDelete);
      }
      
      // Mise à jour de l'UI
      setReports(reports.filter(r => r.id !== reportToDelete));
      toast.success("Rapport supprimé avec succès");
    } catch (error) {
      console.error('Failed to delete report:', error);
      toast.error("Erreur lors de la suppression du rapport");
    } finally {
      setLoading(false);
      setReportToDelete(null);
    }
  };

  const handleEditReport = (report: Report) => {
    setCurrentReport(report);
    setIsEditMode(true);
    setOpenDialog(true);
  };

  const handleOpenDialog = () => {
    setIsEditMode(false);
    setCurrentReport(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentReport(null);
    setIsEditMode(false);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Rapports" />
        <div className="flex-1 overflow-auto p-6">
          <ReportsHeader
            title="Rapports de projets"
            openDialog={openDialog}
            setOpenDialog={setOpenDialog}
            isEditMode={isEditMode}
            currentReport={currentReport}
            handleOpenDialog={handleOpenDialog}
            handleCreateReport={handleCreateReport}
            handleUpdateReport={handleUpdateReport}
            handleCloseDialog={handleCloseDialog}
            canCreateReports={canCreateReports}
          />
          
          <ReportsSearch 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          <ReportsList 
            reports={reports}
            loading={loading}
            isManagerOrAdmin={isManagerOrAdmin}
            isProjectManager={isProjectManager}
            userId={user?.id}
            formatDate={formatDate}
            handleEditReport={handleEditReport}
            handleDelete={handleDelete}
            searchTerm={searchTerm}
          />
        </div>
      </div>
      
      <DeleteReportDialog 
        reportToDelete={reportToDelete}
        setReportToDelete={setReportToDelete}
        confirmDelete={confirmDelete}
      />
    </div>
  );
};

export default Reports;
