const { Events, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "../log-config.json");

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

    const options = interaction.options?._hoistedOptions || [];
    const optionDetails = options.length
      ? options.map((opt) => `• **${opt.name}:** \`${opt.value}\``).join("\n")
      : "• *(No options provided)*";

    const embed = new EmbedBuilder()
      .setTitle("📋 Command Log")
      .setColor(0x6c3483)
      .setDescription(
        `A command was used in **${interaction.guild?.name || "DM"}**.`
      )
      .setThumbnail(interaction.user.displayAvatarURL())
      .addFields(
        {
          name: "👤 User",
          value: `<@${interaction.user.id}> (\`${interaction.user.tag}\` | \`${interaction.user.id}\`)`,
          inline: false,
        },
        {
          name: "💬 Command",
          value: `\`/${interaction.commandName}\``,
          inline: true,
        },
        {
          name: "📺 Channel",
          value: interaction.channel
            ? `<#${interaction.channel.id}> (\`${interaction.channel.name}\`)`
            : "DM",
          inline: true,
        },
        {
          name: "🕒 Time",
          value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
          inline: false,
        },
        {
          name: "🔧 Options",
          value: optionDetails,
          inline: false,
        }
      )
      .setFooter({
        text: "Command Logger",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    try {
      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Failed to send log message:", error);
    }
  },
};
