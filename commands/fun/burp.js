const { SlashCommandBuilder } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  entersState,
  VoiceConnectionStatus,
} = require("@discordjs/voice");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("burp")
    .setDescription("Plays a burp sound in your voice channel."),

  async execute(interaction) {
    const member = interaction.guild.members.cache.get(interaction.user.id);
    const channel = member?.voice?.channel;

    if (!channel) {
      return interaction.reply({
        content: "❌ Join a voice channel first!",
        flags: 64, // Use flags instead of ephemeral
      });
    }

    await interaction.deferReply({ flags: 64 }); // Use flags instead of ephemeral

    const player = createAudioPlayer();
    const resource = createAudioResource(
      path.join(__dirname, "..", "..", "sounds", "burp.wav")
    );

    let connection;
    try {
      connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false,
      });

      await entersState(connection, VoiceConnectionStatus.Ready, 5000);
      connection.subscribe(player);
      player.play(resource);

      player.once(AudioPlayerStatus.Idle, () => {
        connection.destroy();
      });

      player.on("error", (error) => {
        console.error("❌ Audio player error:", error);
        connection.destroy();
      });

      await interaction.editReply({
        content: "✅ Playing burp sound in your VC!",
      });
    } catch (error) {
      if (connection) connection.destroy();
      console.error("❌ Failed to join VC:", error);
      return interaction.editReply({
        content: "❌ Could not join VC: " + error.message,
      });
    }
  },
};
