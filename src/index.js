require('dotenv').config();

const BotClient = require('./structures/BotClient');
const Database = require('./services/Database');
const Logger = require('./services/Logger');

const client = new BotClient();

// --- LOAD ANTI-CRASH HANDLERS ---
require('./handlers/AntiCrash')(client);

// --- GRACEFUL SHUTDOWN ---
const shutdown = async (signal) => {
  Logger.warn(`[Process] ${signal} received. Shutting down gracefully...`);

  try {
    await Database.disconnect();
    await client.destroy();
  } catch (error) {
    Logger.error('[Process] Error during shutdown', error);
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// --- PROCESS SAFETY NET ---
process.on('unhandledRejection', (reason, promise) => {
  Logger.error('[Process] Unhandled Rejection', {
    reason,
    promise
  });
});

process.on('uncaughtException', (error) => {
  Logger.error('[Process] Uncaught Exception', error);
});

// --- START BOT ---
client.start();
