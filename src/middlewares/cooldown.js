import ms from 'ms';
import { CuteEmbedBuilder } from '../helpers/embedBuilder.js';
import { TimeUtils } from '../helpers/timeUtils.js';

export class CooldownMiddleware {
    static async checkCooldown(interaction, client, commandName, cooldownTime = 3000) {
        const cooldownKey = `${commandName}-${interaction.user.id}`;
        const userCooldown = client.cooldowns.get(cooldownKey);
        
        if (userCooldown && Date.now() < userCooldown) {
            const timeLeft = userCooldown - Date.now();
            const formattedTime = TimeUtils.prettyTime(timeLeft);
            
            await interaction.reply({
                embeds: [CuteEmbedBuilder.warning(
                    'Cooldown Active',
                    `Please wait **${formattedTime}** before using this command again! 🌸`
                )],
                ephemeral: true
            });
            return false;
        }

        client.cooldowns.set(cooldownKey, Date.now() + cooldownTime);
        
        setTimeout(() => {
            client.cooldowns.delete(cooldownKey);
        }, cooldownTime);

        return true;
    }

    static async checkGlobalCooldown(interaction, client, cooldownTime = 1000) {
        const globalKey = `global-${interaction.user.id}`;
        const globalCooldown = client.cooldowns.get(globalKey);
        
        if (globalCooldown && Date.now() < globalCooldown) {
            const timeLeft = globalCooldown - Date.now();
            
            await interaction.reply({
                embeds: [CuteEmbedBuilder.warning(
                    'Slow Down!',
                    `You're using commands too fast! Wait ${ms(timeLeft, { long: true })} 💔`
                )],
                ephemeral: true
            });
            return false;
        }

        client.cooldowns.set(globalKey, Date.now() + cooldownTime);
        return true;
    }

    static clearUserCooldowns(client, userId) {
        const keysToDelete = [];
        
        for (const [key] of client.cooldowns) {
            if (key.endsWith(`-${userId}`)) {
                keysToDelete.push(key);
            }
        }
        
        keysToDelete.forEach(key => client.cooldowns.delete(key));
        return keysToDelete.length;
    }

    static getUserCooldowns(client, userId) {
        const userCooldowns = new Map();
        
        for (const [key, expiry] of client.cooldowns) {
            if (key.endsWith(`-${userId}`) && Date.now() < expiry) {
                const commandName = key.split('-')[0];
                const timeLeft = expiry - Date.now();
                userCooldowns.set(commandName, timeLeft);
            }
        }
        
        return userCooldowns;
    }
}