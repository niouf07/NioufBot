const { Events, EmbedBuilder } = require("discord.js");
const logChannel = "1385336386982510602";

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.user.bot) return;

    const channel = interaction.client.channels.cache.get(logChannel);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle("Command Used")
      .setColor(0x5865f2)
      .addFields(
        { name: "User", value: `<@${interaction.user.id}> (${interaction.user.tag})`, inline: false },
        { name: "Command", value: `/${interaction.commandName}`, inline: false },
        { name: "Channel", value: `<#${interaction.channel.id}>`, inline: false },
        { name: "Time", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
      );

    try {
      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Failed to send log message:", error);
    }
  },
};
