const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unban a user from the server")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to unban")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for the unban")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const reason =
      interaction.options.getString("reason") || "No reason provided";

    if (!user) {
      return interaction.reply("Please provide a valid user to unban.");
    }

    try {
      await interaction.guild.members.unban(user, { reason });
      await interaction.reply(
        `Successfully unbanned ${user.tag} for: ${reason}`
      );
    } catch (error) {
      console.error(error);
      await interaction.reply(
        "An error occurred while trying to unban the user."
      );
    }
  },
};
