const { Events, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "../log-config.json"); // Correct path

console.log("Loading log event handler...");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.user.bot) return;

    // Load config
    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
    const logChannel = config[interaction.guild?.id];
    if (!logChannel) return;

    // Fetch channel from cache or API
    let channel = interaction.client.channels.cache.get(logChannel);
    if (!channel) {
      try {
        channel = await interaction.client.channels.fetch(logChannel);
      } catch {
        console.error("Log channel not found or inaccessible:", logChannel);
        return;
      }
    }

    const embed = new EmbedBuilder()
      .setTitle("Command Used")
      .setColor(0x5865f2)
      .addFields(
        {
          name: "User",
          value: `<@${interaction.user.id}> (${interaction.user.tag})`,
          inline: false,
        },
        {
          name: "Command",
          value: `/${interaction.commandName}`,
          inline: false,
        },
        {
          name: "Channel",
          value: `<#${interaction.channel.id}>`,
          inline: false,
        },
        {
          name: "Time",
          value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
          inline: false,
        }
      );

    try {
      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Failed to send log message:", error);
    }
  },
};
