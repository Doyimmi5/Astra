const Case = require('../database/schemas/Case');
const Logger = require('./Logger');

class ModerationService {
  async createCase(guildId, targetId, moderatorId, action, reason) {
    try {
      const lastCase = await Case.findOne({ guildId }).sort({ caseId: -1 });
      const newCaseId = lastCase ? lastCase.caseId + 1 : 1;

      const newCase = await Case.create({
        guildId,
        caseId: newCaseId,
        targetId,
        moderatorId,
        action,
        reason,
      });

      Logger.info(`[Moderation] Case #${newCaseId} created in Guild ${guildId} - ${action}`);
      return newCase;
    } catch (error) {
      Logger.error('Failed to create moderation case', error);
      throw error;
    }
  }

  /**
   * Busca histórico de um usuário
   */
  async getHistory(guildId, targetId) {
    return await Case.find({ guildId, targetId }).sort({ timestamp: -1 });
  }
}

module.exports = new ModerationService();