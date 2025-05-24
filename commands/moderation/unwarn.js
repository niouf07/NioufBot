const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unwarn")
    .setDescription("Remove a warning from a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to remove a warning from")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("warnid")
        .setDescription("The ID of the warning to remove")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const warnID = interaction.options.getString("warnid");

    if (!user) {
      await interaction.reply({
        content: "Please provide a valid user to unwarn.",
        flags: 64,
      });
      return;
    }

    const db = interaction.client.db;
    if (!db) {
      await interaction.reply({
        content: `Database connection not found.`,
        flags: 64,
      });
      return;
    }

    db.query(
      "DELETE FROM warning WHERE warnID = ? AND guildID = ? AND userID = ?",
      [warnID, interaction.guild.id, user.id],
      (err, result) => {
        if (err) {
          console.error("Failed to delete warning from database:", err);
          if (!interaction.replied && !interaction.deferred) {
            interaction.reply({
              content: `An error occurred while trying to remove the warning.`,
              flags: 64,
            });
          }
          return;
        }
        if (result.affectedRows === 0) {
          if (!interaction.replied && !interaction.deferred) {
            interaction.reply({
              content: `No warning found with ID \`${warnID}\` for ${user.tag}.`,
              flags: 64,
            });
          }
          return;
        }
        if (!interaction.replied && !interaction.deferred) {
          interaction.reply({
            content: `Successfully removed warning ID \`${warnID}\` from ${user.tag}.`,
            flags: 64,
          });
        }
      }
    );
  },
};
