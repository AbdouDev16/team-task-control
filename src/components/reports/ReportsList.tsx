
import React from 'react';
import { Calendar, Download, FileText, Edit, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Report } from '@/types';

interface ReportsListProps {
  reports: Report[];
  loading: boolean;
  isManagerOrAdmin: boolean;
  isProjectManager: boolean;
  userId?: number;
  formatDate: (dateString: string) => string;
  handleEditReport: (report: Report) => void;
  handleDelete: (id: number) => void;
  searchTerm: string;
}

const ReportsList = ({ 
  reports, 
  loading, 
  isManagerOrAdmin, 
  isProjectManager, 
  userId,
  formatDate, 
  handleEditReport, 
  handleDelete,
  searchTerm
}: ReportsListProps) => {
  
  // Filtrer les rapports en fonction du terme de recherche
  const filteredReports = reports.filter(report => 
    report.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.contenu.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (filteredReports.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
        <h3 className="text-lg font-medium">Aucun rapport trouvé</h3>
        <p className="text-muted-foreground mt-2">
          {searchTerm 
            ? "Aucun rapport ne correspond à votre recherche." 
            : "Commencez par ajouter un nouveau rapport."}
        </p>
      </div>
    );
  }

  return (
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
                {(isManagerOrAdmin || (isProjectManager && userId === report.chef_projet_id)) && (
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
    </div>
  );
};

export default ReportsList;
