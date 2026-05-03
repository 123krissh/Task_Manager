import { Response } from 'express';
import { Project, User, Task } from '../models';
import { AuthRequest } from '../middleware/auth';

const isProjectAdmin = (project: any, userId: string): boolean =>
  project.owner.toString() === userId ||
  project.members.some((member: any) => member.user.toString() === userId && member.role === 'admin');

const buildDefinedUpdate = (payload: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));

// GET /api/projects (Get all projects for current user)
// @access  Private
export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const projects = await Project.find({
      $or: [
        { owner: req.userId },
        { 'members.user': req.userId }
      ]
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/projects (Create a new project)
// @access  Private
export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { name, description, color } = req.body;

    const project = new Project({
      name,
      description,
      color,
      owner: req.userId,
      members: [{ user: req.userId, role: 'admin' }]
    });

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: populatedProject
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/projects/:id (Get project by ID)
// @access  Private
export const getProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    // Check if user has access
    const isOwnerOrMember =
      project.owner._id.toString() === req.userId ||
      project.members.some(m => m.user._id.toString() === req.userId);

    if (!isOwnerOrMember) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/projects/:id (Update project)
// @access  Private
export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { name, description, color } = req.body;
    const projectId = req.params.id;

    const project = await Project.findById(projectId);

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    // Check if user is admin of the project
    if (!isProjectAdmin(project, req.userId)) {
      res.status(403).json({ success: false, message: 'Only admins can update project' });
      return;
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      buildDefinedUpdate({ name, description, color }),
      { new: true, runValidators: true }
    )
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/projects/:id (Delete project)
// @access  Private
export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    // Only owner can delete
    if (project.owner.toString() !== req.userId) {
      res.status(403).json({ success: false, message: 'Only owner can delete project' });
      return;
    }

    // Delete all tasks in the project
    await Task.deleteMany({ project: req.params.id });

    // Delete the project
    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/projects/:id/members (Add member to project)
// @access  Private
export const addMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { email, role = 'member' } = req.body;
    const projectId = req.params.id;

    const project = await Project.findById(projectId);

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    // Check if current user is admin
    if (!isProjectAdmin(project, req.userId)) {
      res.status(403).json({ success: false, message: 'Only admins can add members' });
      return;
    }

    // Find user by email
    const userToAdd = await User.findOne({ email: email.toLowerCase() });

    if (!userToAdd) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Check if already a member
    const isAlreadyMember = project.members.some(
      m => m.user.toString() === userToAdd._id.toString()
    );

    if (isAlreadyMember) {
      res.status(400).json({ success: false, message: 'User is already a member' });
      return;
    }

    // Add member
    project.members.push({ user: userToAdd._id, role });
    await project.save();

    const updatedProject = await Project.findById(projectId)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json({
      success: true,
      message: 'Member added successfully',
      data: updatedProject
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/projects/:id/members/:userId (Remove member from project)
// @access  Private
export const removeMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id: projectId, userId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    // Check if current user is admin
    if (!isProjectAdmin(project, req.userId)) {
      res.status(403).json({ success: false, message: 'Only admins can remove members' });
      return;
    }

    // Cannot remove owner
    if (project.owner.toString() === userId) {
      res.status(400).json({ success: false, message: 'Cannot remove project owner' });
      return;
    }

    // Remove member
    project.members = project.members.filter(
      m => m.user.toString() !== userId
    );
    await project.save();

    const updatedProject = await Project.findById(projectId)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json({
      success: true,
      message: 'Member removed successfully',
      data: updatedProject
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/projects/:id/members/:userId/role (Update member role in project)
// @access  Private
export const updateMemberRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id: projectId, userId } = req.params;
    const { role } = req.body;

    // Validate role
    if (!['admin', 'member'].includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role' });
      return;
    }

    const project = await Project.findById(projectId);

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    // Check if current user is admin
    if (!isProjectAdmin(project, req.userId)) {
      res.status(403).json({ success: false, message: 'Only admins can update member roles' });
      return;
    }

    // Cannot change owner's role
    if (project.owner.toString() === userId) {
      res.status(400).json({ success: false, message: 'Cannot change project owner role' });
      return;
    }

    // Find and update member role
    const memberIndex = project.members.findIndex(
      m => m.user.toString() === userId
    );

    if (memberIndex === -1) {
      res.status(404).json({ success: false, message: 'Member not found' });
      return;
    }

    project.members[memberIndex].role = role;
    await project.save();

    const updatedProject = await Project.findById(projectId)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json({
      success: true,
      message: 'Member role updated successfully',
      data: updatedProject
    });
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
