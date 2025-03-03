/**
 * Badge routes for GoodGuilds API
 */
const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

/**
 * @route POST /api/badges
 * @desc Create a new badge
 * @access Protected
 */
router.post('/', 
  authenticate,
  validateRequest([
    {
      field: 'name',
      validations: ['required']
    },
    {
      field: 'description',
      validations: ['optional']
    },
    {
      field: 'icon_url',
      validations: ['optional']
    }
  ]),
  badgeController.createBadge
);

/**
 * @route GET /api/badges
 * @desc Get all badges (with pagination)
 * @access Public
 */
router.get('/', badgeController.getAllBadges);

/**
 * @route GET /api/badges/my-badges
 * @desc Get all badges created by the current user
 * @access Protected
 */
router.get('/my-badges', authenticate, badgeController.getUserBadges);

/**
 * @route GET /api/badges/:badgeId
 * @desc Get badge by ID
 * @access Public
 */
router.get('/:badgeId', badgeController.getBadgeById);

/**
 * @route PUT /api/badges/:badgeId
 * @desc Update badge
 * @access Protected (badge creator only)
 */
router.put('/:badgeId', 
  authenticate,
  validateRequest([
    {
      field: 'name',
      validations: ['optional']
    },
    {
      field: 'description',
      validations: ['optional']
    },
    {
      field: 'icon_url',
      validations: ['optional']
    }
  ]),
  badgeController.updateBadge
);

/**
 * @route POST /api/badges/:badgeId/assign-to-user
 * @desc Assign badge to a user
 * @access Protected (badge creator only)
 */
router.post('/:badgeId/assign-to-user', 
  authenticate,
  validateRequest([
    {
      field: 'userId',
      validations: ['required']
    }
  ]),
  badgeController.assignBadgeToUser
);

/**
 * @route POST /api/badges/:badgeId/assign-to-guild
 * @desc Assign badge to a guild
 * @access Protected (badge creator only)
 */
router.post('/:badgeId/assign-to-guild', 
  authenticate,
  validateRequest([
    {
      field: 'guildId',
      validations: ['required']
    }
  ]),
  badgeController.assignBadgeToGuild
);

/**
 * @route DELETE /api/badges/:badgeId/users/:userId
 * @desc Revoke badge from a user
 * @access Protected (badge creator only)
 */
router.delete('/:badgeId/users/:userId', 
  authenticate,
  badgeController.revokeBadgeFromUser
);

/**
 * @route DELETE /api/badges/:badgeId/guilds/:guildId
 * @desc Revoke badge from a guild
 * @access Protected (badge creator only)
 */
router.delete('/:badgeId/guilds/:guildId', 
  authenticate,
  badgeController.revokeBadgeFromGuild
);

/**
 * @route GET /api/badges/:badgeId/users
 * @desc Get all users who have a specific badge
 * @access Protected (badge creator only)
 */
router.get('/:badgeId/users', 
  authenticate,
  badgeController.getBadgeUsers
);

/**
 * @route GET /api/badges/:badgeId/guilds
 * @desc Get all guilds that have a specific badge
 * @access Protected (badge creator only)
 */
router.get('/:badgeId/guilds', 
  authenticate,
  badgeController.getBadgeGuilds
);

/**
 * @route GET /api/badges/verify/user/:userId/:badgeId
 * @desc Verify if a user has a specific badge
 * @access Public
 */
router.get('/verify/user/:userId/:badgeId', 
  badgeController.verifyUserBadge
);

/**
 * @route GET /api/badges/verify/guild/:guildId/:badgeId
 * @desc Verify if a guild has a specific badge
 * @access Public
 */
router.get('/verify/guild/:guildId/:badgeId', 
  badgeController.verifyGuildBadge
);

module.exports = router;