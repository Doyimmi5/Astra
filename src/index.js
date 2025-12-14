require('dotenv').config();
const BotClient = require('./structures/BotClient');
const Database = require('./services/Database');
const Logger = require('./services/Logger');

const client = new BotClient();

// Graceful Shutdown
const shutdown = async () => {
  Logger.warn('Shutdown signal received. Cleaning up...');
  await Database.disconnect();
  await client.destroy();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

process.on('unhandledRejection', (reason, promise) => {
  Logger.error('Unhandled Rejection at:', promise);
  console.error(reason);
});

// Start
client.start();