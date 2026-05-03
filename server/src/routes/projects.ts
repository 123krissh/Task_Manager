import { Router } from 'express';
import {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole
} from '../controllers/projectController';
import { authMiddleware } from '../middleware/auth';
import {
  createProjectValidation,
  updateProjectValidation,
  addMemberValidation,
  updateMemberRoleValidation,
  mongoIdParam,
  memberParams
} from '../middleware/validationRules';
import { validate } from '../middleware/validate';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Project routes
router.get('/', getProjects);
router.post('/', createProjectValidation, validate, createProject);
router.get('/:id', mongoIdParam, validate, getProject);
router.put('/:id', mongoIdParam, validate, updateProjectValidation, validate, updateProject);
router.delete('/:id', mongoIdParam, validate, deleteProject);

// Member routes
router.post('/:id/members', mongoIdParam, validate, addMemberValidation, validate, addMember);
router.delete('/:id/members/:userId', memberParams, validate, removeMember);
router.put('/:id/members/:userId/role', memberParams, validate, updateMemberRoleValidation, validate, updateMemberRole);

export default router;
