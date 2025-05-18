
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProjectsData } from './useProjectsData';
import { useProjectActions } from './useProjectActions';

export function useProjectsService() {
  const { user, apiAvailable } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Fix here: make sure we're correctly identifying admin and manager roles
  const canModifyProject = user?.role === 'Admin' || user?.role === 'Gérant';
  const isEmployee = user?.role === 'Employé';

  console.log('Current user role in useProjectsService:', user?.role);
  console.log('Can modify project in useProjectsService:', canModifyProject);

  const {
    projects,
    projectManagers,
    setProjects,
    setProjectManagers,
    loadProjects,
    loadProjectManagers
  } = useProjectsData({
    apiAvailable,
    isEmployee
  });

  const {
    createProject,
    updateProject,
    deleteProject
  } = useProjectActions({
    apiAvailable,
    projects,
    projectManagers,
    setProjects,
    canModifyProject,
    setLoading
  });

  useEffect(() => {
    loadProjects();
    loadProjectManagers();
  }, [user, apiAvailable]);

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
