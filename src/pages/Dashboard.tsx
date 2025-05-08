
import React from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import TaskCard from '@/components/TaskCard';
import ProjectCard from '@/components/ProjectCard';
import { Card } from '@/components/ui/card';
import { 
  ClipboardList, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Users
} from 'lucide-react';

// Mock data
const mockTasks = [
  {
    id: 1,
    nom: 'Conception de la base de données',
    description: 'Création du schéma de base de données pour le projet CRM',
    projet_id: 1,
    employe_id: 3,
    statut: 'En cours' as const,
    date_debut: '2025-05-01',
    date_fin: '2025-05-15'
  },
  {
    id: 2,
    nom: 'Développement Front-end',
    description: 'Création de l\'interface utilisateur avec React',
    projet_id: 1,
    employe_id: 4,
    statut: 'Non commencé' as const,
    date_debut: '2025-05-16',
    date_fin: '2025-05-30'
  },
  {
    id: 3,
    nom: 'Tests unitaires',
    description: 'Création des tests unitaires pour les différentes fonctionnalités',
    projet_id: 2,
    employe_id: 5,
    statut: 'Terminé' as const,
    date_debut: '2025-04-20',
    date_fin: '2025-04-30'
  }
];

const mockProjects = [
  {
    id: 1,
    nom: 'CRM Entreprise',
    description: 'Système de gestion de la relation client pour PME',
    chef_projet_id: 2,
    date_debut: '2025-05-01',
    date_fin: '2025-07-30'
  },
  {
    id: 2,
    nom: 'Application Mobile',
    description: 'Application mobile de suivi de stock pour entrepôts',
    chef_projet_id: 3,
    date_debut: '2025-04-15',
    date_fin: '2025-06-15'
  }
];

const Dashboard = () => {
  const { user } = useAuth();
  const isEmployee = user?.role === 'Employé';
  
  const StatCard = ({ icon, value, label, color }: { 
    icon: React.ReactNode; 
    value: string | number; 
    label: string;
    color: string;
  }) => {
    return (
      <Card className="dashboard-card flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          <h3 className="text-2xl font-semibold">{value}</h3>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </Card>
    );
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Tableau de bord" />
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6">Bienvenue, {user?.username}</h2>
            
            {!isEmployee && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  icon={<ClipboardList size={24} className="text-white" />}
                  value={mockProjects.length}
                  label="Projets actifs"
                  color="bg-project-blue"
                />
                <StatCard 
                  icon={<Users size={24} className="text-white" />}
                  value={5}
                  label="Employés"
                  color="bg-project-purple"
                />
                <StatCard 
                  icon={<CheckCircle2 size={24} className="text-white" />}
                  value={mockTasks.filter(t => t.statut === 'Terminé').length}
                  label="Tâches terminées"
                  color="bg-project-green"
                />
                <StatCard 
                  icon={<AlertCircle size={24} className="text-white" />}
                  value={2}
                  label="Tâches en retard"
                  color="bg-project-red"
                />
              </div>
            )}
            
            {isEmployee && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                  icon={<ClipboardList size={24} className="text-white" />}
                  value={mockTasks.length}
                  label="Mes tâches"
                  color="bg-project-blue"
                />
                <StatCard 
                  icon={<Clock size={24} className="text-white" />}
                  value={mockTasks.filter(t => t.statut === 'En cours').length}
                  label="En cours"
                  color="bg-project-yellow"
                />
                <StatCard 
                  icon={<Calendar size={24} className="text-white" />}
                  value={"15/05"}
                  label="Prochaine échéance"
                  color="bg-project-purple"
                />
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Tâches récentes</h2>
                <a href="/tasks" className="text-sm text-primary hover:underline">
                  Voir tout
                </a>
              </div>
              <div className="space-y-4">
                {mockTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
            
            {!isEmployee && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Projets en cours</h2>
                  <a href="/projects" className="text-sm text-primary hover:underline">
                    Voir tout
                  </a>
                </div>
                <div className="space-y-4">
                  {mockProjects.map(project => (
                    <ProjectCard 
                      key={project.id} 
                      project={project} 
                      progress={project.id === 1 ? 30 : 75} 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
