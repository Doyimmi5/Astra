import 'dotenv/config';
import ExtendedClient from './src/structures/ExtendedClient.js';
import figlet from 'figlet';
import gradient from 'gradient-string';
import boxen from 'boxen';
import chalk from 'chalk';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

async function startBot() {
    console.clear();
    
    const title = figlet.textSync('Astra Bot', { font: 'ANSI Shadow' });
    const gradientTitle = gradient.pastel.multiline(title);
    
    console.log(boxen(gradientTitle, {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'magenta'
    }));
    
    console.log(chalk.magenta('💖 Starting cute femboy moderation bot...'));
    
    const client = new ExtendedClient();
    await client.start();
}

startBot().catch(console.error);