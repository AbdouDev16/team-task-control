
import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Task } from '@/types';

// Custom hooks
import { useTasksService } from '@/hooks/useTasksService';

// Components
import TasksHeader from '@/components/tasks/TasksHeader';
import TasksSearch from '@/components/tasks/TasksSearch';
import TasksFilter from '@/components/tasks/TasksFilter';
import TasksList from '@/components/tasks/TasksList';
import DeleteTaskDialog from '@/components/tasks/DeleteTaskDialog';

const Tasks = () => {
  const {
    tasks,
    projects,
    employees,
    loading,
    isEmployee,
    canCreateTask,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask
  } = useTasksService();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setIsEditMode(true);
    setOpenDialog(true);
  };

  const handleOpenDialog = () => {
    setIsEditMode(false);
    setCurrentTask(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentTask(null);
    setIsEditMode(false);
  };

  const handleCreateTask = async (formData: any) => {
    try {
      const success = await createTask(formData);
      if (success) {
        setOpenDialog(false);
      }
    } catch (error) {
      console.error('Error in handleCreateTask:', error);
    }
  };

  const handleUpdateTask = async (formData: any) => {
    try {
      if (!currentTask) return;
      const success = await updateTask(currentTask.id, formData);
      if (success) {
        setOpenDialog(false);
        setCurrentTask(null);
        setIsEditMode(false);
      }
    } catch (error) {
      console.error('Error in handleUpdateTask:', error);
    }
  };

  const handleDelete = (id: number) => {
    setTaskToDelete(id);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    const success = await deleteTask(taskToDelete);
    if (success) {
      setTaskToDelete(null);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Tâches" />
        <div className="flex-1 overflow-auto p-6">
          <TasksHeader
            title={isEmployee ? 'Mes tâches' : 'Toutes les tâches'}
            openDialog={openDialog}
            setOpenDialog={setOpenDialog}
            isEditMode={isEditMode}
            currentTask={currentTask}
            handleOpenDialog={handleOpenDialog}
            handleCloseDialog={handleCloseDialog}
            handleCreateTask={handleCreateTask}
            handleUpdateTask={handleUpdateTask}
            projects={projects}
            employees={employees}
            canCreateTask={canCreateTask}
          />
          
          <TasksSearch 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
          />
          
          <TasksFilter 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
          
          <TasksList
            loading={loading}
            tasks={tasks}
            searchTerm={searchTerm}
            activeTab={activeTab}
            canCreateTask={canCreateTask}
            handleEditTask={handleEditTask}
            handleDelete={handleDelete}
            handleUpdateStatus={updateTaskStatus}
          />
        </div>
      </div>
      
      <DeleteTaskDialog
        taskToDelete={taskToDelete}
        setTaskToDelete={setTaskToDelete}
        confirmDelete={confirmDelete}
      />
    </div>
  );
};

export default Tasks;
