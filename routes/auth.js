import express from 'express';
import { hashPassword, comparePassword, validatePassword } from '../middleware/passwordUtils.js';
import { generateToken, verifyToken, isAdmin } from '../middleware/auth.js';
import { validate, loginSchema, changePasswordSchema } from '../middleware/validation.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';
import logger from '../middleware/logger.js';

const router = express.Router();

// Hardcoded admin credentials (in production, use database)
// In .env: ADMIN_USERNAME=admin, ADMIN_PASSWORD_HASH=... (hashed password)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || 'admin'; // Will implement proper hashing in DB

// Login Route
router.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // TODO: In production, fetch from database with hashed passwords
  // For now, simple comparison
  if (username !== ADMIN_USERNAME) {
    logger.warn('Failed login attempt', { username, reason: 'Invalid username' });
    throw new ApiError(401, 'Invalid username or password', 'INVALID_CREDENTIALS');
  }

  // TODO: Use comparePassword(password, ADMIN_PASSWORD_HASH) for hashed passwords
  if (password !== ADMIN_PASSWORD_HASH) {
    logger.warn('Failed login attempt', { username, reason: 'Invalid password' });
    throw new ApiError(401, 'Invalid username or password', 'INVALID_CREDENTIALS');
  }

  const token = generateToken(1, username, 'admin');

  logger.info('Admin login successful', { username });

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: 1,
      username,
      role: 'admin'
    },
    expiresIn: '7d'
  });
}));

// Verify Token Route
router.get('/verify', verifyToken, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
}));

// Logout Route (client-side: delete token from localStorage)
router.post('/logout', verifyToken, asyncHandler(async (req, res) => {
  logger.info('Admin logout', { userId: req.user.userId });
  res.json({
    success: true,
    message: 'Logout successful'
  });
}));

// Change Password Route
router.post('/change-password', 
  verifyToken, 
  isAdmin, 
  validate(changePasswordSchema), 
  asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    
    // TODO: In production, fetch user from database
    if (oldPassword !== ADMIN_PASSWORD_HASH) {
      throw new ApiError(401, 'Old password is incorrect', 'INVALID_PASSWORD');
    }

    // Validate new password strength
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      throw new ApiError(400, 'Password does not meet security requirements', 'WEAK_PASSWORD', validation.errors);
    }

    // TODO: In production, hash and save to database
    logger.info('Password changed', { userId: req.user.userId });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  })
);

// Refresh Token Route
router.post('/refresh', verifyToken, asyncHandler(async (req, res) => {
  const token = generateToken(req.user.userId, req.user.username, req.user.role);

  res.json({
    success: true,
    token,
    expiresIn: '7d'
  });
}));

export default router;
