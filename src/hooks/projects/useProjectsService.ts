
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProjectsData } from './useProjectsData';
import { useProjectActions } from './useProjectActions';

export function useProjectsService() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const canModifyProject = user?.role === 'Admin' || user?.role === 'Gérant';
  const isEmployee = user?.role === 'Employé';

  const {
    projects,
    projectManagers,
    setProjects,
    setProjectManagers,
    loadProjects,
    loadProjectManagers
  } = useProjectsData({
    apiAvailable: true,
    isEmployee
  });

  const {
    createProject,
    updateProject,
    deleteProject
  } = useProjectActions({
    apiAvailable: true,
    projects,
    projectManagers,
    setProjects,
    canModifyProject,
    setLoading
  });

  useEffect(() => {
    loadProjects();
    loadProjectManagers();
  }, [user]);

  return {
    projects,
    projectManagers,
    loading,
    createProject,
    updateProject,
    deleteProject,
    canModifyProject
  };
}
