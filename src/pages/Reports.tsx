
import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Download, FileText, PlusCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Mock data
const mockReports = [
  {
    id: 1,
    titre: 'Rapport d\'avancement CRM',
    contenu: 'Le projet CRM avance selon le planning prévu. La phase de conception de la base de données est terminée.',
    date_creation: '2025-05-05T14:30:00',
    chef_projet_id: 2
  },
  {
    id: 2,
    titre: 'Tests de performance mobile',
    contenu: 'Les tests de performance de l\'application mobile montrent des résultats satisfaisants. Quelques optimisations sont nécessaires.',
    date_creation: '2025-05-03T10:15:00',
    chef_projet_id: 3
  },
  {
    id: 3,
    titre: 'Revue de code mensuelle',
    contenu: 'La revue de code du mois de mai a révélé quelques problèmes de sécurité mineurs qui ont été corrigés.',
    date_creation: '2025-05-01T16:45:00',
    chef_projet_id: 2
  }
];

const Reports = () => {
  const { user } = useAuth();
  const [reports] = useState(mockReports);
  
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

  const isProjectManager = user?.role === 'Chef_Projet';
  const isManagerOrAdmin = user?.role === 'Gérant' || user?.role === 'Admin';
  const canCreateReports = isProjectManager || isManagerOrAdmin;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Rapports" />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Rapports de projets</h1>
            {canCreateReports && (
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nouveau rapport
              </Button>
            )}
          </div>

          <div className="grid gap-6">
            {reports.map((report) => (
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
                    <p className="text-muted-foreground">{report.contenu}</p>
                  </div>
                  <div className="bg-muted p-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Rapport #{report.id}</span>
                    </div>
                    {isManagerOrAdmin && (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">Modifier</Button>
                        <Button variant="ghost" size="sm" className="text-destructive">Supprimer</Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
