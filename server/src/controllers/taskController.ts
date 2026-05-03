import { Response } from 'express';
import { Types } from 'mongoose';
import { Task, Project } from '../models';
import { AuthRequest } from '../middleware/auth';

const isProjectMember = (project: any, userId: string): boolean =>
  project.owner.toString() === userId ||
  project.members.some((member: any) => member.user.toString() === userId);

const isProjectAdmin = (project: any, userId: string): boolean =>
  project.owner.toString() === userId ||
  project.members.some((member: any) => member.user.toString() === userId && member.role === 'admin');

const isValidProjectAssignee = (project: any, assignee?: string | null): boolean => {
  if (!assignee) return true;

  return project.owner.toString() === assignee ||
    project.members.some((member: any) => member.user.toString() === assignee);
};

const buildDefinedUpdate = (payload: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));

// GET /api/projects/:projectId/tasks (Get all tasks for a project)
// @access  Private
export const getTasksByProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { projectId } = req.params;

    // Check project access
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    if (!isProjectMember(project, req.userId)) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const tasks = await Task.find({ project: projectId })
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/projects/:projectId/tasks (Create a new task)
// @access  Private
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { projectId } = req.params;
    const { title, description, status, priority, dueDate, assignee } = req.body;

    // Check project access
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    if (!isProjectMember(project, req.userId)) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    if (!isValidProjectAssignee(project, assignee)) {
      res.status(400).json({ success: false, message: 'Assignee must be a project member' });
      return;
    }

    const task = new Task({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate,
      project: projectId,
      assignee: assignee || undefined,
      createdBy: req.userId
    });

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: populatedTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/tasks/:id (Get task by ID)
// @access  Private
export const getTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    // Check access via project
    const project = await Project.findById(task.project);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    if (!isProjectMember(project, req.userId)) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/tasks/:id (Update task)
// @access  Private
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    // Check access via project
    const project = await Project.findById(task.project);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    if (!isProjectMember(project, req.userId)) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    // Check if user is admin or creator
    const isCreator = task.createdBy.toString() === req.userId;

    if (!isProjectAdmin(project, req.userId) && !isCreator) {
      res.status(403).json({ success: false, message: 'Only admins or creator can update task' });
      return;
    }

    const { title, description, status, priority, dueDate, assignee } = req.body;

    if (!isValidProjectAssignee(project, assignee)) {
      res.status(400).json({ success: false, message: 'Assignee must be a project member' });
      return;
    }

    const updates = buildDefinedUpdate({
      title,
      description,
      status,
      priority,
      dueDate: dueDate === null ? null : dueDate || undefined,
      assignee: assignee === undefined ? undefined : assignee ? new Types.ObjectId(assignee) : null
    });

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/tasks/:id (Delete task)
// @access  Private
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    // Check access via project
    const project = await Project.findById(task.project);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    // Only admins can delete
    if (!isProjectAdmin(project, req.userId)) {
      res.status(403).json({ success: false, message: 'Only admins can delete tasks' });
      return;
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/tasks/:id/status (Update task status)
// @access  Private
export const updateTaskStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { status } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    // Check access via project
    const project = await Project.findById(task.project);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    if (!isProjectMember(project, req.userId)) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    // Only admin, creator, or assignee can update status
    const isCreator = task.createdBy.toString() === req.userId;
    const isAssignee = task.assignee?.toString() === req.userId;

    if (!isProjectAdmin(project, req.userId) && !isCreator && !isAssignee) {
      res.status(403).json({
        success: false,
        message: 'Only admins, creator, or assignee can update task status'
      });
      return;
    }

    // Update status
    task.status = status;
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
