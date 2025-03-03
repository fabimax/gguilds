/**
 * Guild Invited Handles routes
 */
const express = require('express');
const router = express.Router();
const guildInvitedHandlesController = require('../controllers/guildInvitedHandlesController');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

/**
 * @route GET /api/guilds/:guildId/invited-handles
 * @desc Get all invited handles for a guild
 * @access Public
 */
router.get('/:guildId/invited-handles', guildInvitedHandlesController.getInvitedHandles);

/**
 * @route POST /api/guilds/:guildId/invited-handles
 * @desc Add a social handle to invited handles
 * @access Protected (admin only)
 */
router.post('/:guildId/invited-handles', 
  authenticate,
  validateRequest([
    {
      field: 'socialProvider',
      validations: ['required']
    },
    {
      field: 'socialHandle',
      validations: ['required']
    }
  ]),
  guildInvitedHandlesController.addInvitedHandle
);

/**
 * @route DELETE /api/guilds/:guildId/invited-handles/:handleId
 * @desc Remove an invited handle
 * @access Protected (admin only)
 */
router.delete('/:guildId/invited-handles/:handleId', 
  authenticate,
  guildInvitedHandlesController.removeInvitedHandle
);

/**
 * @route GET /api/guilds/:guildId/check-eligibility
 * @desc Check if current user is eligible to join via invited handle
 * @access Protected
 */
router.get('/:guildId/check-eligibility', 
  authenticate,
  guildInvitedHandlesController.checkEligibility
);

/**
 * @route POST /api/guilds/:guildId/join-with-handle
 * @desc Join guild with a pre-approved social handle
 * @access Protected
 */
router.post('/:guildId/join-with-handle', 
  authenticate,
  validateRequest([
    {
      field: 'invitedHandleId',
      validations: ['required']
    }
  ]),
  guildInvitedHandlesController.joinWithInvitedHandle
);

module.exports = router;