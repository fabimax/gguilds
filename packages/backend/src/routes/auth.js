/**
 * Authentication routes for GoodGuilds API
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRequest } = require('../middleware/validation');

/**
 * @route POST /api/auth/signup
 * @desc Register a new user
 * @access Public
 */
router.post('/signup', 
  validateRequest([
    {
      field: 'email',
      validations: ['required', 'email']
    },
    {
      field: 'password',
      validations: ['required', 'min:6']
    },
    {
      field: 'name',
      validations: ['optional']
    }
  ]),
  authController.signup
);

/**
 * @route POST /api/auth/login
 * @desc Login with email and password
 * @access Public
 */
router.post('/login', 
  validateRequest([
    {
      field: 'email',
      validations: ['required', 'email']
    },
    {
      field: 'password',
      validations: ['required']
    }
  ]),
  authController.login
);

/**
 * @route GET /api/auth/twitter
 * @desc Get Twitter/X OAuth URL
 * @access Public
 */
router.get('/twitter', authController.getTwitterAuthUrl);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh auth token
 * @access Public
 */
router.post('/refresh', 
  validateRequest([
    {
      field: 'refresh_token',
      validations: ['required']
    }
  ]),
  authController.refreshToken
);

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 * @access Protected
 */
router.post('/logout', authController.logout);


/**
 * @route POST /api/auth/callback
 * @desc Handle OAuth callback
 * @access Public
 */
router.post('/callback', authController.handleAuthCallback);



/**
 * @route POST /api/auth/validate-session
 * @desc Validate and create session from OAuth callback
 * @access Public
 */
router.post('/validate-session', authController.validateSession);

/**
 * @route POST /api/auth/verify-tokens
 * @desc Verify tokens and return user data
 * @access Public
 */
router.post('/verify-tokens', authController.verifyTokens);

module.exports = router;