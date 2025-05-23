const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clear messages from a channel")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The number of messages to clear")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");

    if (amount < 1 || amount > 100) {
      return interaction.reply("Please provide a number between 1 and 100.");
    }

    try {
      const fetched = await interaction.channel.messages.fetch({
        limit: amount,
      });
      await interaction.channel.bulkDelete(fetched);
      await interaction.reply(`Successfully deleted ${fetched.size} messages.`);
    } catch (error) {
      console.error(error);
      await interaction.reply(
        "An error occurred while trying to clear messages."
      );
    }
  },
};
