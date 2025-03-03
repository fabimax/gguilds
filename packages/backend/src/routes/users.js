/**
 * User routes for GoodGuilds API
 */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

/**
 * @route GET /api/users/me
 * @desc Get current user profile
 * @access Protected
 */
router.get('/me', authenticate, userController.getCurrentUser);

/**
 * @route GET /api/users/:userId
 * @desc Get user profile by ID
 * @access Public (basic info) / Protected (detailed info)
 */
router.get('/:userId', optionalAuth, userController.getUserById);

/**
 * @route PUT /api/users/me
 * @desc Update current user profile
 * @access Protected
 */
router.put('/me', 
  authenticate,
  validateRequest([
    {
      field: 'name',
      validations: ['optional']
    },
    {
      field: 'bio',
      validations: ['optional', 'max:500']
    },
    {
      field: 'avatar_url',
      validations: ['optional']
    }
  ]),
  userController.updateProfile
);

module.exports = router;