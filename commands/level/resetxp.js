const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resetxp")
    .setDescription("Resets a user's experience points")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user whose experience points to reset")
        .setRequired(true)
    ),

  async execute(interaction) {
    const db = interaction.client.db;
    if (!db) {
      return interaction.reply({
        content: "Database connection is not available.",
        flags: 64,
      });
    }

    const user = interaction.options.getUser("user");
    const userID = user.id;
    const guildID = interaction.guild.id;

    // Reset user experience and level
    db.query(
      `UPDATE level SET experience = 0, level = 1 WHERE userID = ? AND guildID = ?`,
      [userID, guildID],
      (err) => {
        if (err) {
          console.error("Failed to reset user experience:", err);
          return interaction.reply({
            content: "Failed to reset user data.",
            flags: 64,
          });
        }
        interaction.reply({
          content: `Successfully reset ${user.username}'s experience points.`,
          flags: 64,
        });
      }
    );
  },
};
