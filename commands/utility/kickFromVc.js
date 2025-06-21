const { SlashCommandBuilder } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Disconnects the bot from the voice channel."),

  async execute(interaction) {
    const guildId = interaction.guildId;
    const connection = getVoiceConnection(guildId);

    if (!connection) {
      return interaction.reply({
        content: "❌ I'm not connected to any voice channel.",
        flags: 1 << 6, // ephemeral
      });
    }

    connection.destroy();

    return interaction.reply({
      content: "✅ Disconnected from the voice channel!",
      flags: 1 << 6,
    });
  },
};
