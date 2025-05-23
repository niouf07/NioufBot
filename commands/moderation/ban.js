const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user from the server")
    .addUserOption((option) =>
      option.setName("user").setDescription("The user to ban").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for the ban")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const reason =
      interaction.options.getString("reason") || "No reason provided";

    if (!user) {
      return interaction.reply("Please provide a valid user to ban.");
    }

    try {
      await interaction.guild.members.ban(user, { reason });
      await interaction.reply(`Successfully banned ${user.tag} for: ${reason}`);
    } catch (error) {
      console.error(error);
      await interaction.reply(
        "An error occurred while trying to ban the user."
      );
    }
  },
};
