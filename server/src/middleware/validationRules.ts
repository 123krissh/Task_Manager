import { body, param, query } from 'express-validator';

// Auth validation rules
export const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Project validation rules
export const createProjectValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Project name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Please enter a valid hex color')
];

export const updateProjectValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Project name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Please enter a valid hex color')
];

export const addMemberValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['admin', 'member'])
    .withMessage('Role must be admin or member')
];

export const updateMemberRoleValidation = [
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['admin', 'member'])
    .withMessage('Role must be admin or member')
];

// Task validation rules
export const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'review', 'completed'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Please enter a valid date'),
  body('assignee')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid assignee ID')
];

export const updateTaskValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'review', 'completed'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Please enter a valid date'),
  body('assignee')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid assignee ID')
];

export const updateTaskStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['todo', 'in_progress', 'review', 'completed'])
    .withMessage('Invalid status')
];

// Common validation rules
export const mongoIdParam = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];

export const memberParams = [
  param('id')
    .isMongoId()
    .withMessage('Invalid project ID format'),
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID format')
];

export const projectIdParam = [
  param('projectId')
    .isMongoId()
    .withMessage('Invalid project ID format')
];

export const taskIdParam = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID format')
];
