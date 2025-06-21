const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "../../log-config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setlog")
    .setDescription("Set the log channel for this server")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to use for logs")
        .setRequired(true)
    ),
  // .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    if (!channel || channel.type !== 0) {
      return interaction.reply({
        content: "Please select a text channel.",
        flags: 64,
      });
    }
    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
    config[interaction.guild.id] = channel.id;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    await interaction.reply({
      content: `Log channel set to <#${channel.id}>`,
      flags: 64,
    });
  },
};
