
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Download, FileText, PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { reportService } from '@/services/api';
import { toast } from 'sonner';
import { Report } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ReportForm from '@/components/forms/ReportForm';
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
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

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

  // Filtrer les rapports en fonction du terme de recherche
  const filteredReports = reports.filter(report => 
    report.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.contenu.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Rapports" />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Rapports de projets</h1>
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
          
          <div className="relative flex-1 mb-6">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Rechercher un rapport..." 
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredReports.map((report) => (
                <Card key={report.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-semibold mb-2">{report.titre}</h2>
                          <div className="flex items-center text-sm text-muted-foreground mb-4">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>{formatDate(report.date_creation)}</span>
                          </div>
                        </div>
                        {(isManagerOrAdmin || isProjectManager) && (
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Télécharger
                          </Button>
                        )}
                      </div>
                      <p className="text-muted-foreground whitespace-pre-line">
                        {report.contenu.length > 300 
                          ? `${report.contenu.substring(0, 300)}...` 
                          : report.contenu}
                      </p>
                    </div>
                    <div className="bg-muted p-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Rapport #{report.id}</span>
                      </div>
                      <div className="flex gap-2">
                        {/* Chef de projet peut éditer/supprimer ses propres rapports */}
                        {(isManagerOrAdmin || (isProjectManager && user?.id === report.chef_projet_id)) && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleEditReport(report)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(report.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredReports.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-lg font-medium">Aucun rapport trouvé</h3>
                  <p className="text-muted-foreground mt-2">
                    {searchTerm 
                      ? "Aucun rapport ne correspond à votre recherche." 
                      : "Commencez par ajouter un nouveau rapport."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <AlertDialog open={reportToDelete !== null} onOpenChange={(open) => !open && setReportToDelete(null)}>
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
    </div>
  );
};

export default Reports;
