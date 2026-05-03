import { Router } from 'express';
import { register, login, getMe, getAllUsers } from '../controllers/authController';
import { registerValidation, loginValidation } from '../middleware/validationRules';
import { validate } from '../middleware/validate';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);

// Protected routes
router.get('/me', authMiddleware, getMe);
router.get('/users', authMiddleware, getAllUsers);

export default router;