import { useEffect, useState } from 'react';
import { ProjectCard } from './ProjectCard';
import { ProjectForm } from './ProjectForm';
import { Button } from '../common/Button';
import { useProjects } from '../../context/ProjectContext';
import { Plus, FolderKanban, Loader2 } from 'lucide-react';

export const ProjectList = () => {
  const { projects, loading, createProject, updateProject, fetchProjects } = useProjects();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (data: { name: string; description: string; color: string }) => {
    await createProject(data);
  };

  const handleEditProject = async (data: { name: string; description: string; color: string }) => {
    if (editingProject) {
      await updateProject(editingProject._id, data);
      setEditingProject(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">Manage your team projects</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-card p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <FolderKanban className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Create your first project to start organizing tasks and collaborating with your team.
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}

      <ProjectForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProject}
        mode="create"
      />

      <ProjectForm
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingProject(null);
        }}
        onSubmit={handleEditProject}
        initialData={editingProject}
        mode="edit"
      />
    </div>
  );
};
