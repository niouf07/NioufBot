const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Create the support creator embed")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("Support Ticket")
      .setDescription(
        "Select a reason and click the button below to create a support ticket."
      )
      .setColor(0x5865f2)
      .setFooter({ text: "Support Ticket System" });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("ticket_reason")
      .setPlaceholder("Choose a reason...")
      .addOptions([
        { label: "Report", value: "report" },
        { label: "Suggestion", value: "suggestion" },
        { label: "Bug", value: "bug" },
      ]);

    const button = new ButtonBuilder()
      .setCustomId("create_ticket")
      .setLabel("Create Ticket")
      .setStyle(ButtonStyle.Primary);

    const row1 = new ActionRowBuilder().addComponents(selectMenu);
    const row2 = new ActionRowBuilder().addComponents(button);

    await interaction.reply({
      embeds: [embed],
      components: [row1, row2],
    });
  },
};
