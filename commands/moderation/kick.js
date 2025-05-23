const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user from the server")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to kick")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  async execute(interaction) {
    const user = interaction.options.getUser("user");

    if (!user) {
      return interaction.reply("Please provide a valid user to kick.");
    }

    const member = await interaction.guild.members.fetch(user.id);

    try {
      await member.kick();
      await interaction.reply(`Successfully kicked ${user.tag}`);
    } catch (error) {
      console.error(error);
      await interaction.reply(
        "An error occurred while trying to kick the user."
      );
    }
  },
};
