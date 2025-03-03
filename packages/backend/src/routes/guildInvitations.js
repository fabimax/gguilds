/**
 * Guild Invitations routes
 */
const express = require('express');
const router = express.Router();
const guildInvitationsController = require('../controllers/guildInvitationsController');
const { authenticate } = require('../middleware/auth');

/**
 * @route GET /api/guilds/:guildId/invitations
 * @desc Get all invitations for a guild
 * @access Protected (admin)
 */
router.get('/:guildId/invitations', authenticate, guildInvitationsController.getInvitations);

/**
 * @route DELETE /api/guilds/:guildId/invitations/:invitationId
 * @desc Revoke/delete an invitation
 * @access Protected (admin)
 */
router.delete('/:guildId/invitations/:invitationId', authenticate, guildInvitationsController.revokeInvitation);

/**
 * @route GET /api/guilds/:guildId/invitation-url
 * @desc Get guild URL for social invitation
 * @access Public
 */
router.get('/:guildId/invitation-url', guildInvitationsController.getGuildUrl);

module.exports = router;