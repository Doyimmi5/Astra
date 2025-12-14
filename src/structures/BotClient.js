const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const Database = require('../services/Database');
const Locales = require('../services/Locales');
const Logger = require('../services/Logger');
const { loadHandlers } = require('../handlers/EventHandler');

class BotClient extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
      partials: [Partials.Message, Partials.Channel, Partials.User],
    });

    // Collections
    this.prefixCommands = new Collection();
    this.aliases = new Collection();
    this.slashCommands = new Collection();
    this.contextCommands = new Collection();
    this.cooldowns = new Collection();
    
    // Config Caches
    this.configCache = new Map();
  }

  async start() {
    // 1. Load Services
    Locales.load();
    await Database.connect(process.env.MONGO_URI);

    // 2. Load Handlers
    require('../handlers/CommandHandler')(this);
    require('../handlers/EventHandler')(this);

    // 3. Login
    await this.login(process.env.DISCORD_TOKEN);
  }
}

module.exports = BotClient;