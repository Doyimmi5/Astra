/*
 * Copyright 2024 Astra Bot
 * Licensed under the Apache License, Version 2.0
 */

import chalk from 'chalk';
import gradient from 'gradient-string';
import figlet from 'figlet';
import boxen from 'boxen';
import dayjs from 'dayjs';
import Table from 'cli-table3';
import kleur from 'kleur';
import terminalKit from 'terminal-kit';
const { terminal } = terminalKit;

export class CuteLogger {
    constructor() {
        this.botName = 'Astra Bot';
        this.version = '1.0.0';
        this.startTime = Date.now();

        this.emojis = {
            info: '💖',
            warn: '⚠️',
            error: '💔',
            success: '✨',
            debug: '🐛',
            ready: '🌸',
            database: '📊',
            command: '⚡',
            event: '🎯',
            shard: '🚀',
            load: '📦',
            deploy: '🚀'
        };

        this.colors = {
            info: chalk.cyan,
            warn: chalk.yellow,
            error: chalk.red,
            success: chalk.green,
            debug: chalk.gray,
            ready: chalk.magenta,
            database: chalk.blue,
            command: chalk.white,
            event: chalk.blueBright,
            shard: chalk.magentaBright
        };
    }

    formatMessage(level, message, category = null) {
        const timestamp = dayjs().format('HH:mm:ss');
        const emoji = this.emojis[level] || '📝';
        const color = this.colors[level] || chalk.white;
        
        const brandName = gradient.pastel('Astra');
        const timeStamp = kleur.dim(`[${timestamp}]`);
        const categoryTag = category ? kleur.cyan().bold(`[${category}]`) : '';
        
        return `${brandName} ${timeStamp} ${emoji} ${categoryTag} ${color(message)}`;
    }

    info(message, category = null) {
        console.log(this.formatMessage('info', message, category));
    }

    warn(message, category = null) {
        console.log(this.formatMessage('warn', message, category));
    }

    error(message, category = null) {
        console.log(this.formatMessage('error', message, category));
    }

    success(message, category = null) {
        console.log(this.formatMessage('success', message, category));
    }

    debug(message, category = null) {
        if (process.env.NODE_ENV === 'development') {
            console.log(this.formatMessage('debug', message, category));
        }
    }

    ready(message, category = 'READY') {
        console.log(this.formatMessage('ready', message, category));
    }

    database(message, category = 'DATABASE') {
        console.log(this.formatMessage('database', message, category));
    }

    command(message, category = 'COMMAND') {
        console.log(this.formatMessage('command', message, category));
    }

    event(message, category = 'EVENT') {
        console.log(this.formatMessage('event', message, category));
    }

    shard(message, category = 'SHARD') {
        console.log(this.formatMessage('shard', message, category));
    }

    startup() {
        terminal.clear();
        
        const title = figlet.textSync('Astra Bot', { 
            font: 'ANSI Shadow',
            horizontalLayout: 'fitted'
        });
        
        const gradientTitle = gradient(['#FF69B4', '#FFB6C1', '#DDA0DD', '#98FB98']).multiline(title);
        
        const info = [
            kleur.dim('Licensed under Apache License 2.0'),
            kleur.dim(`Version ${this.version} • Cute Femboy Moderation Bot`),
            kleur.dim(`Node.js ${process.version} • Discord.js v14`),
            '',
            gradient.pastel('💖 Starting cute femboy moderation bot...')
        ].join('\n');
        
        console.log(boxen(gradientTitle + '\n\n' + info, {
            padding: 2,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'magenta',
            backgroundColor: '#000000'
        }));
        
        console.log();
    }

    separator(text = '') {
        const line = '─'.repeat(60);
        if (text) {
            console.log(chalk.dim(line));
            console.log(chalk.magenta.bold(`  ${text}`));
            console.log(chalk.dim(line));
        } else {
            console.log(chalk.dim(line));
        }
    }

    table(title, data) {
        const table = new Table({
            head: [kleur.magenta().bold(title)],
            colWidths: [80],
            style: {
                head: [],
                border: ['magenta']
            },
            chars: {
                'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗',
                'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝',
                'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼',
                'right': '║', 'right-mid': '╢', 'middle': '│'
            }
        });
        
        data.forEach(row => {
            const status = row.status === '✅' ? kleur.green('✅') : kleur.red('❌');
            const name = kleur.cyan().bold(row.name);
            const category = kleur.dim(row.category || '');
            table.push([`${status} ${name} ${category}`]);
        });
        
        console.log(table.toString());
    }

    apiStatus(services) {
        this.separator('API Services Status');
        
        services.forEach(service => {
            const status = service.available ? 
                chalk.green('🟢 Available') : 
                chalk.red('🔴 Unavailable');
            
            console.log(`  ${status} ${chalk.cyan(service.name.padEnd(15))} ${chalk.dim(service.message || '')}`);
        });
        
        console.log();
    }

    stats(stats) {
        const table = new Table({
            head: [kleur.magenta().bold('Statistic'), kleur.magenta().bold('Value')],
            style: {
                head: [],
                border: ['cyan']
            }
        });
        
        Object.entries(stats).forEach(([key, value]) => {
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            table.push([kleur.cyan(formattedKey), kleur.white(value)]);
        });
        
        console.log(table.toString());
    }
}

export default new CuteLogger();