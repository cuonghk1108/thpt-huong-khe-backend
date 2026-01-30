import { z } from 'zod';
import { formatValidationError } from './errorHandler.js';

// News Validation
export const newsSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be less than 200 characters'),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters').max(500, 'Excerpt must be less than 500 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  image: z.string().url('Invalid image URL').optional(),
  category: z.string().min(2, 'Category must be at least 2 characters'),
  author: z.string().min(2, 'Author must be at least 2 characters'),
  date: z.string().datetime('Invalid date format').optional()
});

// Teacher Validation
export const teacherSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  subject: z.string().min(2, 'Subject must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[\d\s\-+()]+$/, 'Invalid phone number').optional(),
  bio: z.string().min(10, 'Bio must be at least 10 characters').optional(),
  image: z.string().url('Invalid image URL').optional()
});

// Club Validation
export const clubSchema = z.object({
  name: z.string().min(3, 'Club name must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500),
  image: z.string().url('Invalid image URL').optional(),
  members: z.number().int('Members must be an integer').min(0).optional(),
  advisor: z.string().min(2, 'Advisor name must be at least 2 characters').optional()
});

// Event Validation
export const eventSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date').optional(),
  location: z.string().min(5, 'Location must be at least 5 characters'),
  image: z.string().url('Invalid image URL').optional(),
  category: z.string().optional()
});

// Gallery Validation
export const gallerySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  url: z.string().url('Invalid image URL'),
  category: z.string().min(2, 'Category must be at least 2 characters').optional(),
  description: z.string().max(500).optional()
});

// Login Validation
export const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(1, 'Password is required')
});

// Change Password Validation
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number'),
  confirmPassword: z.string().min(1, 'Confirm password is required')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Validation Middleware
export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.validated = validated;
      next();
    } catch (error) {
      next(formatValidationError(error));
    }
  };
};

// Validate Query Parameters
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a number').transform(Number).refine(n => n > 0, 'Page must be greater than 0').optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').transform(Number).refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100').optional(),
  sort: z.string().optional(),
  search: z.string().optional()
});

export const validateQuery = (schema) => {
  return async (req, res, next) => {
    try {
      const validated = await schema.parseAsync(req.query);
      req.query = validated;
      next();
    } catch (error) {
      next(formatValidationError(error));
    }
  };
};
