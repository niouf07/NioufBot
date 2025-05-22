const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with the ping of the bot"),
  async execute(interaction) {
    const ping = interaction.client.ws.ping;
    await interaction.reply(`🏓 Pong! WebSocket ping: ${ping}ms`);
  },
};
