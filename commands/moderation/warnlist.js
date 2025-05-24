const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { getWarns } = require("../../loaders/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnlist")
    .setDescription("View the list of warnings for a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to view warnings for")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user");

    if (!user) {
      return interaction.reply({
        content: "Please provide a valid user to view warnings.",
        flags: 64,
      });
    }

    const warns = await getWarns(interaction.guild.id, user.id);

    if (warns.length === 0) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Warnings for ${user.tag}`)
            .setDescription("No warnings found.")
            .setColor(0xed4245),
        ],
        flags: 64,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`Warnings for ${user.tag}`)
      .setColor(0xed4245)
      .setDescription(
        warns
          .map(
            (warn, i) =>
              `**#${i + 1}**\nID: \`${warn.warnID}\`\nReason: ${
                warn.reason
              }\nDate: ${new Date(warn.date).toLocaleString()}\nAuthor: <@${
                warn.authorID
              }>`
          )
          .join("\n\n")
      );

    await interaction.reply({
      embeds: [embed],
      flags: 64,
    });
  },
};
