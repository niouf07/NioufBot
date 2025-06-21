const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "../../voice-config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setvclog")
    .setDescription("Set the voice log channel for this server.")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to log voice events")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    if (!channel || (channel.type !== 0 && channel.type !== 5)) {
      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Invalid Channel")
        .setDescription("Please select a valid text channel.")
        .setColor(0xff0000);
      return interaction.reply({
        embeds: [errorEmbed],
        ephemeral: true,
      });
    }

    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
    config[interaction.guild.id] = channel.id;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    const embed = new EmbedBuilder()
      .setTitle("✅ Voice Log Channel Set")
      .setDescription(`Voice log channel has been set to ${channel}.`)
      .setColor(0x57f287);

    await interaction.reply({
      embeds: [embed],
      flags: 64,
    });
  },
};
