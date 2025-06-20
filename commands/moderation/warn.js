const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a user in the server")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to warn")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for the warning")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const reason =
      interaction.options.getString("reason") || "No reason provided";

    if (!user) {
      return interaction.reply({
        content: "Please provide a valid user to warn.",
        flags: 64, // MessageFlags.Ephemeral
      });
    }

    // Defer reply to avoid interaction timeout
    await interaction.deferReply({ flags: 64 });

    // Attempt to DM the user
    let dmSuccess = true;
    await user
      .send(`You have been warned in ${interaction.guild.name} for: ${reason}`)
      .catch((error) => {
        dmSuccess = false;
        console.error(`Could not send warning message to ${user.tag}:`, error);
      });

    // Insert warning into the database
    const db = interaction.client.db;
    const createId = require("../../function/createid.js");
    let warnID = createId(16, "warn_");
    if (db) {
      db.query(
        "INSERT INTO warning (warnID, guildID, userID, authorID, reason, date) VALUES (?, ?, ?, ?, ?, NOW())",
        [warnID, interaction.guild.id, user.id, interaction.user.id, reason],
        (err) => {
          if (err) {
            console.error("Failed to insert warning into database:", err);
          }
        }
      );
    }

    // Reply to the moderator
    let replyMsg = `Successfully warned ${user.tag} for: ${reason}`;
    if (!dmSuccess) {
      replyMsg += `\n⚠️ Could not send DM to the user.`;
    }
    await interaction.editReply({ content: replyMsg });
  },
};
