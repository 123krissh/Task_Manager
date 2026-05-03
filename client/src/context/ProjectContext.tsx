import { useState, useEffect, ReactNode, createContext, useContext } from 'react';
import api from '../services/api';

interface Project {
  _id: string;
  name: string;
  description?: string;
  color: string;
  owner: any;
  members: Array<{
    user: any;
    role: 'admin' | 'member';
  }>;
  createdAt: string;
  updatedAt: string;
}

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  fetchProjects: () => Promise<void>;
  createProject: (data: { name: string; description?: string; color?: string }) => Promise<Project>;
  updateProject: (id: string, data: { name?: string; description?: string; color?: string }) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addMember: (projectId: string, email: string, role?: string) => Promise<void>;
  removeMember: (projectId: string, userId: string) => Promise<void>;
  updateMemberRole: (projectId: string, userId: string, role: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await api.getProjects();
      if (response.success) {
        setProjects(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (data: { name: string; description?: string; color?: string }) => {
    const response = await api.createProject(data);
    if (response.success && response.data) {
      setProjects((prev) => [response.data, ...prev]);
      return response.data;
    }
    throw new Error(response.message || 'Failed to create project');
  };

  const updateProject = async (id: string, data: { name?: string; description?: string; color?: string }) => {
    const response = await api.updateProject(id, data);
    if (response.success && response.data) {
      setProjects((prev) => prev.map((p) => (p._id === id ? response.data : p)));
    } else {
      throw new Error(response.message || 'Failed to update project');
    }
  };

  const deleteProject = async (id: string) => {
    const response = await api.deleteProject(id);
    if (response.success) {
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } else {
      throw new Error(response.message || 'Failed to delete project');
    }
  };

  const addMember = async (projectId: string, email: string, role: string = 'member') => {
    const response = await api.addMember(projectId, email, role);
    if (response.success && response.data) {
      setProjects((prev) => prev.map((p) => (p._id === projectId ? response.data : p)));
    } else {
      throw new Error(response.message || 'Failed to add member');
    }
  };

  const removeMember = async (projectId: string, userId: string) => {
    const response = await api.removeMember(projectId, userId);
    if (response.success && response.data) {
      setProjects((prev) => prev.map((p) => (p._id === projectId ? response.data : p)));
    } else {
      throw new Error(response.message || 'Failed to remove member');
    }
  };

  const updateMemberRole = async (projectId: string, userId: string, role: string) => {
    const response = await api.updateMemberRole(projectId, userId, role);
    if (response.success && response.data) {
      setProjects((prev) => prev.map((p) => (p._id === projectId ? response.data : p)));
    } else {
      throw new Error(response.message || 'Failed to update member role');
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        loading,
        fetchProjects,
        createProject,
        updateProject,
        deleteProject,
        addMember,
        removeMember,
        updateMemberRole,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};