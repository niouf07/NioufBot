const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "../../ticket-config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setticketcategory")
    .setDescription("Set the category where new tickets will be created")
    .addChannelOption((option) =>
      option
        .setName("category")
        .setDescription("The category channel for tickets")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildCategory)
    ),
  // .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const category = interaction.options.getChannel("category");
    if (!category || category.type !== ChannelType.GuildCategory) {
      return interaction.reply({
        content: "Please select a valid category channel.",
        ephemeral: true,
      });
    }

    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
    config[interaction.guild.id] = category.id;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    await interaction.reply({
      content: `✅ Ticket category set to **${category.name}**.`,
      ephemeral: true,
    });
  },
};
