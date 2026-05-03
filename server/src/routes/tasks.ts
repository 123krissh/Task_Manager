import { Router } from 'express';
import {
  getTasksByProject,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  updateTaskStatus
} from '../controllers/taskController';
import { authMiddleware } from '../middleware/auth';
import {
  projectIdParam,
  taskIdParam,
  createTaskValidation,
  updateTaskValidation,
  updateTaskStatusValidation
} from '../middleware/validationRules';
import { validate } from '../middleware/validate';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Project tasks routes
router.get('/projects/:projectId/tasks', projectIdParam, validate, getTasksByProject);
router.post('/projects/:projectId/tasks', projectIdParam, validate, createTaskValidation, validate, createTask);

// Task routes
router.get('/:id', taskIdParam, validate, getTask);
router.put('/:id', taskIdParam, validate, updateTaskValidation, validate, updateTask);
router.delete('/:id', taskIdParam, validate, deleteTask);
router.put('/:id/status', taskIdParam, validate, updateTaskStatusValidation, validate, updateTaskStatus);

export default router;