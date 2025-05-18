
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useReportsService } from '@/hooks/reports';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FilePlus, FileEdit, Trash2, Search } from 'lucide-react';
import ReportForm from '@/components/forms/ReportForm';
import { Report } from '@/types';

const Reports = () => {
  const { apiAvailable, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [reportToDelete, setReportToDelete] = useState<number | null>(null);

  const {
    reports,
    loading,
    canCreateReport,
    createReport,
    updateReport,
    deleteReport
  } = useReportsService();

  // Filtrer les rapports par le terme de recherche
  const filteredReports = reports.filter(report => 
    report.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.contenu.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateReport = async (formData: any) => {
    const success = await createReport(formData);
    if (success) {
      setOpenDialog(false);
    }
  };

  const handleUpdateReport = async (formData: any) => {
    if (!currentReport) return;
    const success = await updateReport(currentReport.id, formData);
    if (success) {
      setOpenDialog(false);
      setCurrentReport(null);
      setIsEditMode(false);
    }
  };

  const handleDeleteReport = async (reportId: number) => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ce rapport ?");
    if (confirmed) {
      const success = await deleteReport(reportId);
      if (success) {
        setReportToDelete(null);
      }
    }
  };

  const handleEditReport = (report: Report) => {
    setCurrentReport(report);
    setIsEditMode(true);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentReport(null);
    setIsEditMode(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Rapports" />
        <div className="flex-1 overflow-auto p-6">
          {/* Header avec bouton pour créer un rapport */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Rapports</h2>
            {canCreateReport && (
              <Button onClick={() => { setIsEditMode(false); setOpenDialog(true); }}>
                <FilePlus className="mr-2 h-4 w-4" /> Nouveau rapport
              </Button>
            )}
          </div>

          {/* Barre de recherche */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <Input
              className="pl-10"
              placeholder="Rechercher un rapport..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Liste des rapports */}
          {loading ? (
            <div className="text-center p-8">Chargement des rapports...</div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center p-8">
              {searchTerm ? 'Aucun rapport correspondant à votre recherche' : 'Aucun rapport disponible'}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredReports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{report.titre}</CardTitle>
                        <CardDescription>
                          Par {report.chef_projet_nom} {report.chef_projet_prenom} • {formatDate(report.date_creation)}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleEditReport(report)}
                        >
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="text-destructive" 
                          onClick={() => handleDeleteReport(report.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3">{report.contenu}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Dialog pour créer/modifier un rapport */}
      <Dialog open={openDialog} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Modifier le rapport' : 'Créer un nouveau rapport'}</DialogTitle>
          </DialogHeader>
          <ReportForm
            initialData={currentReport || undefined}
            onSubmit={isEditMode ? handleUpdateReport : handleCreateReport}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;
