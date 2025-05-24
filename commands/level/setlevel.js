const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setlevel")
    .setDescription("Sets a user's level")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user whose level to set")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("level")
        .setDescription("The level to set for the user")
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
    const level = interaction.options.getInteger("level");
    const userID = user.id;
    const guildID = interaction.guild.id;

    if (level < 1) {
      return interaction.reply({
        content: "Level must be at least 1.",
        flags: 64,
      });
    }

    // Upsert user row and set level
    db.query(
      `INSERT INTO level (userID, guildID, experience, level) VALUES (?, ?, 0, ?)
       ON DUPLICATE KEY UPDATE level = ?`,
      [userID, guildID, level, level],
      (err) => {
        if (err) {
          console.error("Failed to upsert user row:", err);
          return interaction.reply({
            content: "Failed to update user data.",
            flags: 64,
          });
        }
        interaction.reply({
          content: `Successfully set ${user.username}'s level to ${level}.`,
          flags: 64,
        });
      }
    );
  },
};
