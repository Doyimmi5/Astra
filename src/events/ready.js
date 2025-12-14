import BaseEvent from '../structures/BaseEvent.js';
import chalk from 'chalk';
import gradient from 'gradient-string';
import figlet from 'figlet';
import { ActivityType } from 'discord.js';

class ReadyEvent extends BaseEvent {
    constructor() {
        super({
            name: 'clientReady',
            once: true
        });
    }

    async execute(client) {
        const readyMessage = figlet.textSync('READY!', { font: 'Small' });
        console.log(gradient.pastel(readyMessage));
        
        client.log(`💖 ${client.user.tag} is online and ready!`, 'success');
        client.log(`🌸 Serving ${client.guilds.cache.size} guilds with ${client.users.cache.size} users`, 'info');
        
        // Set bot activities
        const activities = [
            { name: 'over cute servers 💖', type: ActivityType.Watching },
            { name: 'with moderation tools 🔨', type: ActivityType.Playing },
            { name: 'to /help for commands', type: ActivityType.Listening },
            { name: 'users being adorable~', type: ActivityType.Watching }
        ];
        
        let activityIndex = 0;
        const updateActivity = () => {
            client.user.setActivity(activities[activityIndex]);
            activityIndex = (activityIndex + 1) % activities.length;
        };
        
        updateActivity();
        setInterval(updateActivity, 30000);
        
        // Cache guild data
        for (const guild of client.guilds.cache.values()) {
            client.cache.set(`guild_${guild.id}`, {
                id: guild.id,
                name: guild.name,
                memberCount: guild.memberCount,
                ownerId: guild.ownerId
            });
        }
        
        client.log('🎀 Bot initialization complete!', 'success');
    }
}

export default new ReadyEvent();