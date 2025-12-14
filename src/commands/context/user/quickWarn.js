const { 
  ContextMenuCommandBuilder, 
  ApplicationCommandType, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  ActionRowBuilder, 
  PermissionFlagsBits 
} = require('discord.js');

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('Quick Warn')
    .setType(ApplicationCommandType.User)
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const targetUser = interaction.targetUser;

    // 1. Validation (Self/Bot check)
    if (targetUser.id === interaction.user.id || targetUser.bot) {
      return interaction.reply({ 
        content: '❌ You cannot warn this user.', 
        ephemeral: true 
      });
    }

    // 2. Create the Modal
    // We embed the targetID in the customId so we know who to warn later
    const modal = new ModalBuilder()
      .setCustomId(`warn_modal_${targetUser.id}`)
      .setTitle(`Warn ${targetUser.username}`);

    // 3. Create the Input Field
    const reasonInput = new TextInputBuilder()
      .setCustomId('reason_input')
      .setLabel('Reason for warning')
      .setStyle(TextInputStyle.Paragraph) // Multi-line input
      .setPlaceholder('Ex: Spamming in general chat')
      .setRequired(true)
      .setMaxLength(1000);

    const firstActionRow = new ActionRowBuilder().addComponents(reasonInput);
    modal.addComponents(firstActionRow);

    // 4. Show the Modal
    await interaction.showModal(modal);
  },
};