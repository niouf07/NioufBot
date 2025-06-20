const { SlashCommandBuilder } = require("discord.js");
const {
  joinVoiceChannel,
  entersState,
  VoiceConnectionStatus,
} = require("@discordjs/voice");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("testvc")
    .setDescription("Test VC join"),
  async execute(interaction) {
    const channel = interaction.member.voice.channel;
    if (!channel) {
      return interaction.reply({ content: "Join a VC first!", flags: 64 });
    }
    await interaction.deferReply({ flags: 64 }); // Acknowledge immediately

    try {
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });
      await entersState(connection, VoiceConnectionStatus.Ready, 5_000);
      await interaction.editReply({
        content: "Joined VC! Leaving in 2 seconds...",
      });

      setTimeout(() => {
        connection.destroy();
      }, 2000); // Leave after 2 seconds
    } catch (error) {
      await interaction.editReply({
        content: "Failed to join VC: " + error,
      });
    }
  },
};
