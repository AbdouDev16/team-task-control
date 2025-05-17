
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProjectsData } from './useProjectsData';
import { useProjectActions } from './useProjectActions';
import { ProjectWithProgress, ProjectManager } from './types';

export function useProjectsService(apiAvailable: boolean) {
  const { user } = useAuth();
  const canModifyProject = user?.role === 'Admin' || user?.role === 'Gérant';
  const isEmployee = user?.role === 'Employé';

  const {
    projects,
    projectManagers,
    loading,
    setProjects,
    setProjectManagers,
    setLoading
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
