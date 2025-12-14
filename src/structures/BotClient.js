const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials
} = require('discord.js');

const Database = require('../services/Database');
const Locales = require('../services/Locales');
const Logger = require('../services/Logger');
const TaskScheduler = require('../services/TaskScheduler');

class BotClient extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
      ],
      partials: [
        Partials.Message,
        Partials.Channel,
        Partials.User
      ]
    });

    // Command collections
    this.prefixCommands = new Collection();
    this.aliases = new Collection();
    this.slashCommands = new Collection();
    this.contextCommands = new Collection();
    this.cooldowns = new Collection();

    // Guild config cache
    this.configCache = new Map();
  }

  async start() {
    try {
      // Load services
      Locales.load();
      await Database.connect(process.env.MONGO_URI);

      // Load handlers
      require('../handlers/CommandHandler')(this);
      require('../handlers/EventHandler')(this);

      // Login
      await this.login(process.env.DISCORD_TOKEN);

      // Start scheduler AFTER bot is ready
      this.once('ready', () => {
        Logger.info('[Scheduler] Starting task scheduler');
        TaskScheduler.start(this);
      });

    } catch (error) {
      Logger.error('[Client] Failed to start bot', error);
      process.exit(1);
    }
  }
}

module.exports = BotClient;

