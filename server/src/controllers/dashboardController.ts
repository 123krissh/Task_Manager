import { Response } from 'express';
import { Project, Task } from '../models';
import { AuthRequest } from '../middleware/auth';

// GET /api/dashboard/stats (Get dashboard statistics)
// @access  Private
export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Get user's projects
    const projects = await Project.find({
      $or: [
        { owner: req.userId },
        { 'members.user': req.userId }
      ]
    });

    const projectIds = projects.map(p => p._id);

    // Get all tasks for these projects
    const tasks = await Task.find({ project: { $in: projectIds } });

    // Calculate stats
    const totalProjects = projects.length;
    const totalTasks = tasks.length;

    // Tasks by status
    const tasksByStatus = {
      todo: tasks.filter(t => t.status === 'todo').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      review: tasks.filter(t => t.status === 'review').length,
      completed: tasks.filter(t => t.status === 'completed').length
    };

    // Overdue tasks
    const now = new Date();
    const overdueTasks = tasks.filter(t =>
      t.dueDate &&
      new Date(t.dueDate) < now &&
      t.status !== 'completed'
    ).length;

    // High priority tasks
    const highPriorityTasks = tasks.filter(t =>
      (t.priority === 'high' || t.priority === 'urgent') &&
      t.status !== 'completed'
    ).length;

    // Recent projects
    const recentProjects = projects
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map(p => ({
        _id: p._id,
        name: p.name,
        color: p.color,
        memberCount: p.members.length,
        createdAt: p.createdAt
      }));

    // Tasks due soon (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const dueSoon = tasks.filter(t =>
      t.dueDate &&
      new Date(t.dueDate) >= now &&
      new Date(t.dueDate) <= nextWeek &&
      t.status !== 'completed'
    ).slice(0, 10);

    res.json({
      success: true,
      data: {
        totalProjects,
        totalTasks,
        tasksByStatus,
        overdueTasks,
        highPriorityTasks,
        recentProjects,
        dueSoon
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
