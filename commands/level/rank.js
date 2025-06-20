const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription(
      "Check your current level, experience points, and server leaderboard."
    )
    .addUserOption((option) =>
      option.setName("user").setDescription("The user to check the rank of")
    ),
  async execute(interaction) {
    const db = interaction.client.db;
    if (!db) {
      return interaction.reply({
        content: "Database connection is not available.",
        flags: 64,
      });
    }

    const userOption = interaction.options.getUser("user");
    const userID = userOption ? userOption.id : interaction.user.id;
    const guildID = interaction.guild.id;

    db.query(
      `SELECT userID, level, experience FROM level WHERE guildID = ? ORDER BY level DESC, experience DESC`,
      [guildID],
      (err, results) => {
        if (err) {
          console.error("Failed to fetch leaderboard:", err);
          return interaction.reply({
            content: "An error occurred while fetching the leaderboard.",
            flags: 64,
          });
        }

        if (!results || results.length === 0) {
          return interaction.reply({
            content: "No rank information available for this server.",
            flags: 64,
          });
        }

        let leaderboard = "";
        let userRank = null;
        results.forEach((row, i) => {
          const place = i + 1;
          const mention = `<@${row.userID}>`;
          if (place === 1) {
            leaderboard += `🥇 ${mention} — Level **${row.level}** (${row.experience} XP)\n`;
          } else if (place === 2) {
            leaderboard += `🥈 ${mention} — Level **${row.level}** (${row.experience} XP)\n`;
          } else if (place === 3) {
            leaderboard += `🥉 ${mention} — Level **${row.level}** (${row.experience} XP)\n`;
          } else if (place <= 10) {
            leaderboard += `**${place}.** ${mention} — Level **${row.level}** (${row.experience} XP)\n`;
          }
          if (row.userID === userID) userRank = place;
        });

        const userRow = results.find((r) => r.userID === userID);
        let userStats = "";
        if (userRow) {
          userStats = `**Your rank:** ${userRank} / ${results.length}\n**Level:** ${userRow.level}\n**XP:** ${userRow.experience}`;
        } else {
          userStats = "You have no rank information available.";
        }

        const embed = new EmbedBuilder()
          .setTitle("🏆 Server Leaderboard")
          .setColor(0x5865f2)
          .setDescription(leaderboard || "No leaderboard data.")
          .addFields({
            name: userOption ? `${userOption.username}'s Stats` : "Your Stats",
            value: userStats,
            inline: false,
          })
          .setTimestamp();

        interaction.reply({ embeds: [embed] });
      }
    );
  },
};
