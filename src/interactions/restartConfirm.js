import RestartCommand from '../commands/prefix/owner/restart.js';

export default {
    customId: 'restart_confirm',
    type: 'button',
    
    async execute(interaction, client) {
        await RestartCommand.performRestart(interaction, client);
    }
};