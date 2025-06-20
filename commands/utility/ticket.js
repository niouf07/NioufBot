const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ChannelType,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "../../ticket-config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Create the support creator embed"),
  async execute(interaction) {
    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
    let categoryId = config[interaction.guild.id];

    // If no category is set, ask the admin to set one
    if (!categoryId) {
      return interaction.reply({
        content:
          "❌ No ticket category is set for this server. Please use `/setticketcategory` to select your desired category for tickets.",
        ephemeral: true,
      });
    }

    // Fetch the category channel to display its name
    let categoryChannel = null;
    try {
      categoryChannel = await interaction.guild.channels.fetch(categoryId);
    } catch {
      return interaction.reply({
        content:
          "❌ The selected ticket category no longer exists. Please set a new one with `/setticketcategory`.",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("🎫 Support Ticket")
      .setDescription(
        `Need help or want to contact staff?\n\n` +
          `• Tickets will be created in the **${categoryChannel.name}** category.\n` +
          "• Select a reason from the menu below.\n" +
          "• Then click **Create Ticket** to open a private support channel.\n\n" +
          "Our team will assist you as soon as possible!"
      )
      .setColor(0x6c3483)
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setFooter({
        text: "Support Ticket System",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("ticket_reason")
      .setPlaceholder("Choose a reason...")
      .addOptions([
        {
          label: "Report",
          value: "report",
          description: "Report a user or issue",
        },
        {
          label: "Suggestion",
          value: "suggestion",
          description: "Share an idea or feedback",
        },
        {
          label: "Bug",
          value: "bug",
          description: "Report a bug or technical problem",
        },
      ]);

    const button = new ButtonBuilder()
      .setCustomId("create_ticket")
      .setLabel("Create Ticket")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("🎟️");

    const row1 = new ActionRowBuilder().addComponents(selectMenu);
    const row2 = new ActionRowBuilder().addComponents(button);

    await interaction.reply({
      embeds: [embed],
      components: [row1, row2],
    });
  },
};
