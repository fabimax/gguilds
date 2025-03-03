/**
 * Guild routes for GoodGuilds API
 */
const express = require('express');
const router = express.Router();
const guildController = require('../controllers/guildController');
const guildInvitedHandlesRoutes = require('./guildInvitedHandles');
const guildInvitationsRoutes = require('./guildInvitations');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

// Merge invited handles routes
router.use('/', guildInvitedHandlesRoutes);

// Merge invitations routes
router.use('/', guildInvitationsRoutes);

/**
 * @route POST /api/guilds
 * @desc Create a new guild
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
  guildController.createGuild
);

/**
 * @route GET /api/guilds
 * @desc Get all guilds (with pagination)
 * @access Public
 */
router.get('/', guildController.getAllGuilds);

/**
 * @route GET /api/guilds/:guildId
 * @desc Get guild by ID
 * @access Public (basic info) / Protected (detailed info)
 */
router.get('/:guildId', optionalAuth, guildController.getGuildById);

/**
 * @route PUT /api/guilds/:guildId
 * @desc Update guild
 * @access Protected (admin only)
 */
router.put('/:guildId', 
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
  guildController.updateGuild
);

/**
 * @route POST /api/guilds/:guildId/invitations
 * @desc Create guild invitation
 * @access Protected (admin only)
 */
router.post('/:guildId/invitations', 
  authenticate,
  validateRequest([
    {
      field: 'email',
      validations: ['optional', 'email']
    },
    {
      field: 'socialProvider',
      validations: ['optional']
    },
    {
      field: 'socialHandle',
      validations: ['optional']
    }
  ]),
  guildController.createInvitation
);

/**
 * @route POST /api/guilds/invitations/accept
 * @desc Accept guild invitation
 * @access Protected
 */
router.post('/invitations/accept', 
  authenticate,
  validateRequest([
    {
      field: 'token',
      validations: ['required']
    }
  ]),
  guildController.acceptInvitation
);

/**
 * @route DELETE /api/guilds/:guildId/members
 * @desc Leave guild
 * @access Protected
 */
router.delete('/:guildId/members', authenticate, guildController.leaveGuild);

/**
 * @route PUT /api/guilds/:guildId/members/:memberId
 * @desc Change member role
 * @access Protected (admin only)
 */
router.put('/:guildId/members/:memberId', 
  authenticate,
  validateRequest([
    {
      field: 'role',
      validations: ['required']
    }
  ]),
  guildController.changeMemberRole
);

module.exports = router;