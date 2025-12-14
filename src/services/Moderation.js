const Case = require('../database/schemas/Case');
const Logger = require('./Logger');
const LogService = require('./LogService');

class ModerationService {
  /**
   * Creates a moderation case and sends a moderation log.
   * @param {Client} client Discord.js client instance
   * @param {Guild} guild Discord guild
   * @param {string} targetId User ID being moderated
   * @param {string} moderatorId Moderator user ID
   * @param {string} action Moderation action (BAN, WARN, MUTE, etc)
   * @param {string} reason Reason for the action
   */
  async createCase(client, guild, targetId, moderatorId, action, reason) {
    try {
      const lastCase = await Case
        .findOne({ guildId: guild.id })
        .sort({ caseId: -1 })
        .lean();

      const newCaseId = lastCase ? lastCase.caseId + 1 : 1;

      const newCase = await Case.create({
        guildId: guild.id,
        caseId: newCaseId,
        targetId,
        moderatorId,
        action,
        reason,
        timestamp: new Date()
      });

      Logger.info(
        `[Moderation] Case #${newCaseId} created | Guild: ${guild.id} | Action: ${action}`
      );

      await LogService.sendModLog(client, guild, newCase);

      return newCase;
    } catch (error) {
      Logger.error('[Moderation] Failed to create case', error);
      throw error;
    }
  }

  /**
   * Fetch moderation history for a user.
   * @param {string} guildId Discord guild ID
   * @param {string} targetId User ID
   */
  async getHistory(guildId, targetId) {
    return Case
      .find({ guildId, targetId })
      .sort({ timestamp: -1 })
      .lean();
  }
}

module.exports = new ModerationService();
