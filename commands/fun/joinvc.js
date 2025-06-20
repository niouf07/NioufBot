const { SlashCommandBuilder } = require("discord.js");
const {
  joinVoiceChannel,
  entersState,
  VoiceConnectionStatus,
} = require("@discordjs/voice");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("joinvc")
    .setDescription("Test VC join"),
  async execute(interaction) {
    const member = interaction.member;
    const voiceChannel = member.voice.channel;
    if (!voiceChannel)
      return interaction.reply({ content: "Join a VC first!", flags: 64 });
    await interaction.deferReply({ flags: 64 });
    let connection;
    try {
      connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        selfDeaf: false,
      });
      await entersState(connection, VoiceConnectionStatus.Ready, 5_000);
      await interaction.editReply({ content: "Joined VC successfully!" });
      setTimeout(() => connection.destroy(), 5000);
    } catch (error) {
      if (connection) connection.destroy();
      await interaction.editReply({
        content: "Failed to join VC: " + error.message,
      });
      console.error(error);
    }
  },
};
