import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { EventEmitter } from 'events';
import chalk from 'chalk';
import colors from 'colors';
// import Enmap from 'enmap';
// import { QuickDB } from 'quick.db';
import winston from 'winston';
import pino from 'pino';
import _ from 'lodash';
import Database from '../database/connection.js';
import CommandHandler from '../handlers/CommandHandler.js';
import EventHandler from '../handlers/EventHandler.js';
import InteractionHandler from '../handlers/InteractionHandler.js';
import ContextHandler from '../handlers/ContextHandler.js';
import PrefixHandler from '../handlers/PrefixHandler.js';
import ModalHandler from '../handlers/ModalHandler.js';
import ButtonHandler from '../handlers/ButtonHandler.js';
import logger from '../helpers/logger.js';

export default class ExtendedClient extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildModeration,
                GatewayIntentBits.GuildVoiceStates
            ],
            partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User]
        });

        this.commands = new Collection();
        this.events = new Collection();
        this.contexts = new Collection();
        this.interactions = new Collection();
        this.prefixCommands = new Collection();
        this.modals = new Collection();
        this.buttons = new Collection();
        this.cooldowns = new Collection();
        
        // Maintenance mode
        this.maintenanceMode = false;
        this.maintenanceReason = null;
        this.maintenanceStart = null;
        
        this.cache = new Map();
        
        // this.db = new QuickDB();
        this.database = new Database(this);
        
        this.logger = logger;

        this.eventEmitter = new EventEmitter();
        this.handlers = {
            commands: new CommandHandler(this),
            events: new EventHandler(this),
            interactions: new InteractionHandler(this),
            contexts: new ContextHandler(this),
            prefix: new PrefixHandler(this),
            modals: new ModalHandler(this),
            buttons: new ButtonHandler(this)
        };
    }

    log(message, type = 'info', category = null) {
        this.logger[type](message, category);
    }

    async start() {
        try {
            this.logger.startup();
            
            // Check API services
            this.checkAPIServices();
            
            this.logger.database('Connecting to MongoDB...');
            await this.database.connect();
            
            this.logger.info('Loading handlers...', 'STARTUP');
            await this.handlers.commands.load();
            await this.handlers.events.load();
            await this.handlers.interactions.load();
            await this.handlers.contexts.load();
            await this.handlers.prefix.load();
            await this.handlers.modals.load();
            await this.handlers.buttons.load();
            
            this.logger.ready('Logging into Discord...');
            await this.login(process.env.TOKEN);
        } catch (error) {
            this.logger.error(`Failed to start: ${error.message}`, 'STARTUP');
            process.exit(1);
        }
    }
    
    checkAPIServices() {
        const services = [
            {
                name: 'Weather API',
                available: !!process.env.WEATHER_API_KEY,
                message: process.env.WEATHER_API_KEY ? 'Ready' : 'No API key - weather command disabled'
            },
            {
                name: 'Translation',
                available: true,
                message: 'Using free MyMemory API'
            },
            {
                name: 'MongoDB',
                available: !!process.env.MONGODB_URI,
                message: process.env.MONGODB_URI ? 'Ready' : 'No URI provided'
            }
        ];
        
        this.logger.apiStatus(services);
    }
}