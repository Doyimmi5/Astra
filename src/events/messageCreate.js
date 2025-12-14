import BaseEvent from '../structures/BaseEvent.js';
import { AntiSpamMiddleware } from '../middlewares/antiSpam.js';
import { Validators } from '../helpers/validators.js';
import { AutoMod } from '../middlewares/automod.js';

class MessageCreateEvent extends BaseEvent {
    constructor() {
        super({
            name: 'messageCreate',
            once: false
        });
        
        this.antiSpam = new AntiSpamMiddleware();
    }

    async execute(client, message) {
        if (message.author.bot || message.system) return;
        
        try {
            // Auto-moderation check
            if (await AutoMod.checkMessage(message)) return;
            
            // Handle prefix commands
            if (message.guild && client.handlers.prefix) {
                await client.handlers.prefix.handleMessage(message);
            }

            // Cache message data
            if (message.guild) {
                client.cache.set(`msg_${message.id}`, {
                    id: message.id,
                    authorId: message.author.id,
                    channelId: message.channel.id,
                    guildId: message.guild.id,
                    content: message.content,
                    timestamp: message.createdTimestamp
                });

                // Anti-spam check
                if (await this.antiSpam.checkSpam(message)) {
                    client.log(`Spam detected from ${message.author.tag} in ${message.guild.name}`, 'warn');
                    return;
                }

                // Check for spam patterns in content
                if (Validators.isSpam(message.content)) {
                    try {
                        await message.delete();
                        client.log(`Auto-deleted spam message from ${message.author.tag}`, 'info');
                    } catch (error) {
                        // Ignore deletion errors
                    }
                    return;
                }
            }

        } catch (error) {
            client.log(`Error processing message: ${error.message}`, 'error');
        }
    }
}

export default new MessageCreateEvent();