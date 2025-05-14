
import React from 'react';
import { Loader2 } from 'lucide-react';
import TaskCard from '@/components/TaskCard';
import { Task, TaskStatus } from '@/types';

interface TasksListProps {
  loading: boolean;
  tasks: any[];
  searchTerm: string;
  activeTab: string;
  canCreateTask: boolean;
  handleEditTask: (task: Task) => void;
  handleDelete: (id: number) => void;
  handleUpdateStatus: (taskId: number, newStatus: TaskStatus) => void;
}

const TasksList: React.FC<TasksListProps> = ({
  loading,
  tasks,
  searchTerm,
  activeTab,
  canCreateTask,
  handleEditTask,
  handleDelete,
  handleUpdateStatus
}) => {
  // Filtered tasks logic
  const filteredTasks = tasks.filter(task => 
    task.nom.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (activeTab === 'all' 
      || (activeTab === 'not-started' && task.statut === 'Non commencé')
      || (activeTab === 'in-progress' && task.statut === 'En cours')
      || (activeTab === 'completed' && task.statut === 'Terminé')
    )
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTasks.map((task) => (
        <TaskCard 
          key={task.id} 
          task={task} 
          onEdit={canCreateTask ? () => handleEditTask(task) : undefined}
          onDelete={canCreateTask ? () => handleDelete(task.id) : undefined}
          onStatusChange={handleUpdateStatus}
          projectName={task.projet_nom}
          assignee={task.employe_nom && task.employe_prenom 
            ? `${task.employe_prenom} ${task.employe_nom}` 
            : undefined}
        />
      ))}
      
      {filteredTasks.length === 0 && (
        <div className="col-span-3 text-center py-12">
          <p className="text-muted-foreground">Aucune tâche trouvée</p>
          {searchTerm && (
            <p className="text-sm text-muted-foreground mt-2">
              Essayez d'utiliser des termes de recherche différents
            </p>
          )}
          {!searchTerm && activeTab !== 'all' && (
            <p className="text-sm text-muted-foreground mt-2">
              Aucune tâche avec ce statut
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TasksList;
