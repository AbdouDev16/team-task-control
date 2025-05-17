
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useTasksData } from './useTasksData';
import { useTaskActions } from './useTaskActions';

export const useTasksService = () => {
  const { user, apiAvailable } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const isEmployee = user?.role === 'Employé';
  const canCreateTask = user?.role === 'Chef_Projet';

  const {
    tasks,
    projects,
    employees,
    setTasks,
    setProjects,
    setEmployees,
    loadTasksData,
    loadMockData
  } = useTasksData(isEmployee);

  const {
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask
  } = useTaskActions({
    apiAvailable,
    tasks,
    projects,
    employees,
    setTasks,
    canCreateTask,
    setLoading
  });

  useEffect(() => {
    if (apiAvailable) {
      loadTasksData();
    } else {
      loadMockData();
    }
  }, [apiAvailable]);

  return {
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
  };
};
