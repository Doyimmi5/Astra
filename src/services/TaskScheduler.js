const Case = require('../database/schemas/Case');
const Logger = require('./Logger');
const LogService = require('./LogService');

class TaskScheduler {
  constructor() {
    this.interval = null;
  }

  start(client) {
    Logger.info('TaskScheduler iniciado. A verificar expirações a cada 60s.');
    
    // Executa imediatamente e depois a cada 60 segundos
    this.checkExpiredPunishments(client);
    this.interval = setInterval(() => this.checkExpiredPunishments(client), 60 * 1000);
  }

  async checkExpiredPunishments(client) {
    try {
      // 1. Procurar casos ativos onde a data de expiração já passou
      const now = new Date();
      const expiredCases = await Case.find({ 
        active: true, 
        expiresAt: { $ne: null, $lte: now } 
      });

      if (expiredCases.length === 0) return;

      Logger.info(`Encontradas ${expiredCases.length} punições expiradas.`);

      for (const caseData of expiredCases) {
        const guild = client.guilds.cache.get(caseData.guildId);
        
        // Se o servidor já não existe ou o bot foi expulso, desativamos o caso
        if (!guild) {
          caseData.active = false;
          await caseData.save();
          continue;
        }

        // Lógica de Revogação
        try {
          if (caseData.action === 'TEMPBAN') {
            await guild.members.unban(caseData.targetId, 'O banimento temporário expirou.');
            Logger.info(`Utilizador ${caseData.targetId} desbanido automaticamente em ${guild.id}.`);
            
            // Opcional: Enviar log de unban automático
             await LogService.sendModLog(client, guild, {
               ...caseData.toObject(),
               action: 'AUTO-UNBAN',
               reason: 'Tempo de banimento expirado',
               caseId: caseData.caseId // Mantemos o ID original para referência ou criamos um novo
             });
          }
          
          // Aqui adicionaríamos lógica para TEMPMUTE (remover cargo)

        } catch (err) {
          // Erro comum: O utilizador já foi desbanido manualmente
          Logger.warn(`Falha ao revogar punição ${caseData.caseId}: ${err.message}`);
        }

        // 2. Marcar como inativo para não processar novamente
        caseData.active = false;
        await caseData.save();
      }

    } catch (error) {
      Logger.error('Erro no ciclo do TaskScheduler', error);
    }
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
  }
}

module.exports = new TaskScheduler();