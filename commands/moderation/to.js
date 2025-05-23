const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout users in the server")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to timeout")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("time")
        .setDescription("Time to timeout the user (e.g., 10m, 1h, 1d)")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const timeString = interaction.options.getString("time");

    if (!user) {
      return interaction.reply("Please provide a valid user to timeout.");
    }

    // Parse time string to milliseconds
    const timeMs = parseDuration(timeString);
    if (!timeMs) {
      return interaction.reply(
        "Please provide a valid time (e.g., 10m, 1h, 1d)."
      );
    }

    const member = await interaction.guild.members.fetch(user.id);

    try {
      await member.timeout(timeMs);
      await interaction.reply(
        `Successfully timed out ${user.tag} for: ${timeString}`
      );
    } catch (error) {
      console.error(error);
      await interaction.reply(
        "An error occurred while trying to timeout the user."
      );
    }
  },
};

function parseDuration(str) {
  const match = str.match(/^([0-9]+)([smhd])$/);
  if (!match) return null;
  const num = parseInt(match[1]);
  const unit = match[2];
  switch (unit) {
    case "s":
      return num * 1000;
    case "m":
      return num * 60 * 1000;
    case "h":
      return num * 60 * 60 * 1000;
    case "d":
      return num * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
}
