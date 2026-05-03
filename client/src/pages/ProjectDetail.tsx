import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { TaskList } from '../components/tasks/TaskList';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Users, Plus, Trash2, Settings, Loader2 } from 'lucide-react';

interface Project {
  _id: string;
  name: string;
  description?: string;
  color: string;
  owner: { _id: string; name: string; email: string };
  members: Array<{ user: { _id: string; name: string; email: string }; role: 'admin' | 'member' }>;
  createdAt?: string;
  updatedAt?: string;
}

export const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await api.getProject(id!);
      if (response.success) {
        setProject(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = project?.owner._id === user?.id;
  const isAdmin = isOwner || project?.members.some(
    (m) => m.user._id === user?.id && m.role === 'admin'
  );

  const handleAddMember = async () => {
    if (!memberEmail.trim()) return;
    setActionLoading(true);
    try {
      const response = await api.addMember(project!._id, memberEmail, memberRole);
      if (response.success) {
        setProject(response.data);
        setMemberEmail('');
        setShowAddMember(false);
      } else {
        alert(response.message || 'Failed to add member');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to add member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    setActionLoading(true);
    try {
      const response = await api.removeMember(project!._id, userId);
      if (response.success) {
        setProject(response.data);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to remove member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project? All tasks will be deleted.')) return;
    setActionLoading(true);
    try {
      const response = await api.deleteProject(project!._id);
      if (response.success) {
        navigate('/projects');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to delete project');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Project not found</p>
        </div>
      </Layout>
    );
  }

  const allMembers = [
    { user: project.owner, role: 'owner' as const },
    ...project.members
      .filter((member) => member.user._id !== project.owner._id)
      .map((member) => ({ ...member, role: member.role })),
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/projects')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: project.color }}
            >
              {project.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              {project.description && (
                <p className="text-gray-500">{project.description}</p>
              )}
            </div>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setShowAddMember(true)}>
                <Users className="w-4 h-4 mr-2" />
                Add Member
              </Button>
              <Button variant="ghost" onClick={() => setShowSettings(true)}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4">Team Members</h3>
            <div className="space-y-3">
              {allMembers.map((member) => (
                <div key={member.user._id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                    {member.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{member.user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{member.user.email}</p>
                  </div>
                  <Badge variant={member.role === 'owner' ? 'primary' : 'default'} size="sm">
                    {member.role === 'owner' ? 'Owner' : member.role}
                  </Badge>
                  {isAdmin && member.role !== 'owner' && (
                    <button
                      onClick={() => handleRemoveMember(member.user._id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <div className="lg:col-span-3">
            <TaskList
              projectId={project._id}
              members={project.members}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      </div>

      <Modal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        title="Add Team Member"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter member's email"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
          />
          <Select
            label="Role"
            options={[
              { value: 'member', label: 'Member' },
              { value: 'admin', label: 'Admin' },
            ]}
            value={memberRole}
            onChange={(e) => setMemberRole(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAddMember(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember} loading={actionLoading}>
              Add Member
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Project Settings"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Project ID: {project._id}</p>
            {project.createdAt && <p className="text-sm text-gray-600">Created: {new Date(project.createdAt).toLocaleDateString()}</p>}
          </div>
          {isOwner && (
            <div className="pt-4 border-t">
              <Button
                variant="danger"
                className="w-full"
                onClick={handleDeleteProject}
                loading={actionLoading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Project
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                This action cannot be undone. All tasks will be deleted.
              </p>
            </div>
          )}
          <div className="flex justify-end pt-4">
            <Button variant="secondary" onClick={() => setShowSettings(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
