const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with the ping of the bot"),
  async execute(interaction) {
    await interaction.reply("Pinging...");
    const sent = await interaction.fetchReply();
    const roundTrip = sent.createdTimestamp - interaction.createdTimestamp;
    const wsPing = interaction.client.ws.ping;

    const embed = new EmbedBuilder()
      .setTitle("🏓 Pong!")
      .setColor(0x6c3483)
      .setDescription("Here are the current ping stats for the bot:")
      .addFields(
        { name: "Round-trip latency", value: `\`${roundTrip}ms\``, inline: true },
        { name: "WebSocket ping", value: `\`${wsPing}ms\``, inline: true }
      )
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setFooter({
        text: "Pinged with style!",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.editReply({ content: "", embeds: [embed] });
  },
};
