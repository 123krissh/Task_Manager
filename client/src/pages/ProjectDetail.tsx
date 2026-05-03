import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { TaskList } from '../components/tasks/TaskList';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Users, Trash2, Settings, Loader2 } from 'lucide-react';

interface Project {
  _id: string;
  name: string;
  description?: string;
  color: string;
  owner: { _id: string; name: string; email: string };
  members: Array<{ user: { _id: string; name: string; email: string }; role: 'admin' | 'member' }>;
  createdAt?: string;
}

export const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const [showAddMember, setShowAddMember] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTeam, setShowTeam] = useState(false);

  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await api.getProject(id!);
      if (res.success) setProject(res.data);
    } catch {
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = project?.owner._id === user?.id;
  const isAdmin =
    isOwner ||
    project?.members.some(
      (m) => m.user._id === user?.id && m.role === 'admin'
    );

  const handleAddMember = async () => {
    if (!memberEmail.trim()) return;
    setActionLoading(true);
    try {
      const res = await api.addMember(project!._id, memberEmail, memberRole);
      if (res.success) {
        setProject(res.data);
        setShowAddMember(false);
        setMemberEmail('');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Remove this member?')) return;
    const res = await api.removeMember(project!._id, userId);
    if (res.success) setProject(res.data);
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project?')) return;
    const res = await api.deleteProject(project!._id);
    if (res.success) navigate('/projects');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!project) return null;

  const allMembers = [
    { user: project.owner, role: 'owner' as const },
    ...project.members.filter(
      (m) => m.user._id !== project.owner._id
    ),
  ];

  return (
    <Layout>
      <div className="space-y-6">

        {/* HEADER */}
<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white border rounded-xl p-5 shadow-sm">

  <div className="flex items-center gap-4">
    <Button variant="ghost" onClick={() => navigate('/projects')}>
      <ArrowLeft className="w-4 h-4" />
    </Button>

    <div
      className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold"
      style={{ backgroundColor: project.color }}
    >
      {project.name[0]}
    </div>

    <div>
      <h1 className="text-xl font-semibold">{project.name}</h1>
      <p className="text-sm text-gray-500">{project.description}</p>
    </div>
  </div>

  {isAdmin && (
    <div className="flex gap-2">

      {/* TEAM */}
      <Button onClick={() => setShowTeam(true)} variant="secondary">
        <Users className="w-4 h-4 mr-1" />
        Team
      </Button>

      {/* ADD MEMBER */}
      <Button onClick={() => setShowAddMember(true)} variant="secondary">
        Add Member
      </Button>

      {/* DELETE (ONLY OWNER) */}
      {isOwner && (
        <Button
          variant="danger"
          onClick={handleDeleteProject}
          loading={actionLoading}
          className="flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}

    </div>
  )}
</div>

        {/* TASK BOARD FULL WIDTH */}
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <TaskList
            projectId={project._id}
            members={project.members}
            isAdmin={isAdmin}
          />
        </div>
      </div>

      {/* TEAM MODAL */}
      <Modal isOpen={showTeam} onClose={() => setShowTeam(false)} title="Team">
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {allMembers.map((m) => (
            <div key={m.user._id} className="flex items-center gap-3 p-2 border rounded-lg">

              <div className="w-8 h-8 bg-indigo-500 text-white flex items-center justify-center rounded-full">
                {m.user.name[0]}
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium">{m.user.name}</p>
                <p className="text-xs text-gray-500">{m.user.email}</p>
              </div>

              <Badge>{m.role}</Badge>

              {isAdmin && m.role !== 'owner' && (
                <button onClick={() => handleRemoveMember(m.user._id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              )}
            </div>
          ))}
        </div>
      </Modal>

      {/* ADD MEMBER */}
      <Modal isOpen={showAddMember} onClose={() => setShowAddMember(false)} title="Add Member">
        <div className="space-y-4">
          <Input
            label="Email"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
          />
          <Select
            label="Role"
            value={memberRole}
            onChange={(e) => setMemberRole(e.target.value)}
            options={[
              { value: 'member', label: 'Member' },
              { value: 'admin', label: 'Admin' },
            ]}
          />
          <Button onClick={handleAddMember} loading={actionLoading}>
            Add
          </Button>
        </div>
      </Modal>

      {/* SETTINGS */}
      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Settings">
        {isOwner && (
          <Button variant="danger" onClick={handleDeleteProject}>
            Delete Project
          </Button>
        )}
      </Modal>
    </Layout>
  );
};
