const {
  ChannelType,
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  InteractionType,
  EmbedBuilder,
} = require("discord.js");

const userTicketReason = new Map();

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    // Handle reason select menu
    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === "ticket_reason"
    ) {
      userTicketReason.set(interaction.user.id, interaction.values[0]);
      await interaction.reply({
        content: `Reason selected: **${interaction.values[0]}**. Now click "Create Ticket" to continue.`,
        flags: 64,
      });
      return;
    }

    if (interaction.isButton() && interaction.customId === "create_ticket") {
      const reason = userTicketReason.get(interaction.user.id);
      if (!reason) {
        await interaction.reply({
          content: "Please select a reason before creating a ticket.",
          flags: 64,
        });
        return;
      }

      const modal = new ModalBuilder()
        .setCustomId("ticket_query_modal")
        .setTitle("Describe your issue");

      const queryInput = new TextInputBuilder()
        .setCustomId("ticket_query")
        .setLabel("Please describe your issue in detail")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const row = new ActionRowBuilder().addComponents(queryInput);
      modal.addComponents(row);

      await interaction.showModal(modal);
      return;
    }

    if (
      interaction.type === InteractionType.ModalSubmit &&
      interaction.customId === "ticket_query_modal"
    ) {
      const reason =
        userTicketReason.get(interaction.user.id) || "Not specified";
      const query = interaction.fields.getTextInputValue("ticket_query");

      // Defer reply immediately to avoid "Unknown interaction"
      await interaction.deferReply({ flags: 64 });

      // Find the "tickets" category
      const category = interaction.guild.channels.cache.find(
        (c) =>
          c.type === ChannelType.GuildCategory &&
          c.name.toLowerCase() === "tickets"
      );

      if (!category) {
        await interaction.editReply({
          content:
            "Tickets category not found. Please create a category named 'tickets'.",
        });
        return;
      }

      // Create the ticket channel
      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
            ],
          },
        ],
      });

      const ticketEmbed = new EmbedBuilder()
        .setTitle("New Ticket")
        .setColor(0x5865f2)
        .addFields(
          { name: "User", value: `<@${interaction.user.id}>`, inline: false },
          { name: "Reason", value: reason, inline: false },
          { name: "Query", value: query, inline: false }
        )
        .setTimestamp();

      await channel.send({ embeds: [ticketEmbed] });

      await interaction.editReply({
        content: `Your ticket has been created: <#${channel.id}>`,
      });

      userTicketReason.delete(interaction.user.id);
    }
  },
};
