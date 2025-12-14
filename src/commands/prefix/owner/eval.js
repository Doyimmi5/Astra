import PrefixCommand from '../../../structures/PrefixCommand.js';
import { CuteEmbedBuilder } from '../../../helpers/embedBuilder.js';
import util from 'util';

class EvalCommand extends PrefixCommand {
    constructor() {
        super({
            name: 'eval',
            description: 'Evaluate JavaScript code',
            usage: 'eval <code>',
            aliases: ['e', 'evaluate'],
            category: 'owner',
            requiredLevel: 10,
            ownerOnly: true
        });
    }

    async execute(message, args, client) {
        if (!args.length) {
            return message.reply({ embeds: [CuteEmbedBuilder.error('No Code', 'Please provide code to evaluate!')] });
        }

        const code = args.join(' ');
        const startTime = Date.now();

        try {
            let evaled = eval(code);
            
            if (evaled instanceof Promise) {
                evaled = await evaled;
            }

            const endTime = Date.now();
            const executionTime = endTime - startTime;

            let output = util.inspect(evaled, { depth: 0, maxArrayLength: 10 });
            
            if (output.length > 1900) {
                output = output.substring(0, 1900) + '...';
            }

            // Clean sensitive information
            output = this.clean(output);

            const evalEmbed = CuteEmbedBuilder.success(
                '✅ Code Evaluated',
                `Execution completed in ${executionTime}ms`
            );

            evalEmbed.addFields([
                { name: '📥 Input', value: `\`\`\`js\n${code.substring(0, 1000)}\`\`\``, inline: false },
                { name: '📤 Output', value: `\`\`\`js\n${output}\`\`\``, inline: false },
                { name: '⏱️ Execution Time', value: `${executionTime}ms`, inline: true },
                { name: '📊 Type', value: typeof evaled, inline: true }
            ]);

            await message.reply({ embeds: [evalEmbed] });

        } catch (error) {
            const errorOutput = this.clean(error.toString());
            
            const errorEmbed = CuteEmbedBuilder.error(
                '❌ Evaluation Error',
                'An error occurred during code execution'
            );

            errorEmbed.addFields([
                { name: '📥 Input', value: `\`\`\`js\n${code.substring(0, 1000)}\`\`\``, inline: false },
                { name: '❌ Error', value: `\`\`\`js\n${errorOutput}\`\`\``, inline: false }
            ]);

            await message.reply({ embeds: [errorEmbed] });
        }
    }

    clean(text) {
        if (typeof text === 'string') {
            return text
                .replace(/`/g, '`' + String.fromCharCode(8203))
                .replace(/@/g, '@' + String.fromCharCode(8203))
                .replace(new RegExp(process.env.TOKEN, 'gi'), '[TOKEN]')
                .replace(new RegExp(process.env.MONGODB_URI, 'gi'), '[DATABASE_URI]');
        }
        return text;
    }
}

export default new EvalCommand();