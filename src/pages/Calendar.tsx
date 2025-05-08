
import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import TaskCard from '@/components/TaskCard';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Task } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  },
  {
    id: 4,
    nom: 'Intégration API',
    description: 'Connexion du frontend avec les points d\'API backend',
    projet_id: 1,
    employe_id: 3,
    statut: 'Non commencé' as const,
    date_debut: '2025-06-01',
    date_fin: '2025-06-15'
  },
  {
    id: 5,
    nom: 'Design UI mobile',
    description: 'Création des maquettes pour l\'application mobile',
    projet_id: 2,
    employe_id: 4,
    statut: 'En cours' as const,
    date_debut: '2025-05-05',
    date_fin: '2025-05-20'
  }
];

// Get days of the week
const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2025, 4, 1)); // May 2025
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(2025, 4, 8)); // May 8, 2025
  
  // Function to get tasks for selected date
  const getTasksForDate = (date: Date | undefined): Task[] => {
    if (!date) return [];
    
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    return mockTasks.filter(task => {
      const startDate = new Date(task.date_debut);
      const endDate = new Date(task.date_fin);
      const selectedDate = new Date(formattedDate);
      
      return selectedDate >= startDate && selectedDate <= endDate;
    });
  };
  
  const tasksForSelectedDate = getTasksForDate(selectedDate);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Calendrier" />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Calendrier des tâches</h1>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP', { locale: fr }) : 'Sélectionner une date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Calendar header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">{format(currentMonth, 'MMMM yyyy', { locale: fr })}</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    const newDate = new Date(currentMonth);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setCurrentMonth(newDate);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newDate = new Date(currentMonth);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setCurrentMonth(newDate);
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Days of week header */}
            <div className="grid grid-cols-7 border-b">
              {weekDays.map((day, index) => (
                <div 
                  key={index} 
                  className="py-2 text-center text-sm font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid (simplified for demo) */}
            <div className="grid grid-cols-7 grid-rows-5">
              {Array.from({ length: 35 }).map((_, i) => {
                const dayNumber = i - 2; // Start with last two days of April
                const dayDate = new Date(2025, 4, dayNumber);
                const isSelected = selectedDate && dayDate.toDateString() === selectedDate.toDateString();
                const isCurrentMonth = dayDate.getMonth() === currentMonth.getMonth();
                
                // Check if there are tasks for this date
                const hasTasks = mockTasks.some(task => {
                  const taskStart = new Date(task.date_debut);
                  const taskEnd = new Date(task.date_fin);
                  return dayDate >= taskStart && dayDate <= taskEnd;
                });
                
                return (
                  <div
                    key={i}
                    className={`h-24 border-r border-b p-1 ${
                      isSelected ? 'bg-muted' : ''
                    } ${!isCurrentMonth ? 'text-muted-foreground bg-muted/30' : ''}`}
                    onClick={() => setSelectedDate(dayDate)}
                  >
                    <div className="flex justify-between">
                      <span className={`text-sm font-medium ${isSelected ? 'text-primary' : ''}`}>{dayDate.getDate()}</span>
                      {hasTasks && (
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      )}
                    </div>
                    {hasTasks && isCurrentMonth && (
                      <div className="mt-1">
                        <div className="text-xs truncate px-1 py-0.5 bg-blue-100 text-blue-800 rounded">
                          {mockTasks.filter(task => {
                            const taskStart = new Date(task.date_debut);
                            const taskEnd = new Date(task.date_fin);
                            return dayDate >= taskStart && dayDate <= taskEnd;
                          })[0]?.nom || ""}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Task list for selected date */}
          {selectedDate && (
            <div className="mt-8">
              <h2 className="text-lg font-medium mb-4">
                Tâches pour le {format(selectedDate, 'dd MMMM yyyy', { locale: fr })} :
              </h2>
              
              <div className="space-y-4">
                {tasksForSelectedDate.length > 0 ? (
                  tasksForSelectedDate.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))
                ) : (
                  <p className="text-muted-foreground">Aucune tâche pour cette date.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
