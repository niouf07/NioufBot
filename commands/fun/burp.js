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
    .setDescription("Plays a burp sound in your current voice channel"),
  async execute(interaction) {
    const user = interaction.member;
    const voiceChannel = user.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        content: "You must be in a voice channel to use this command!",
        flags: 64,
      });
    }

    await interaction.deferReply({ flags: 64 });

    let connection;
    try {
      connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });

      await entersState(connection, VoiceConnectionStatus.Ready, 20_000);

      const filePath = path.join(__dirname, "..", "..", "sounds", "burp.mp3");
      const resource = createAudioResource(filePath);
      const player = createAudioPlayer();

      connection.subscribe(player);

      player.on(AudioPlayerStatus.Idle, () => {
        if (connection && connection.state.status !== VoiceConnectionStatus.Destroyed) {
          connection.destroy();
        }
      });

      player.on("error", (error) => {
        if (connection && connection.state.status !== VoiceConnectionStatus.Destroyed) {
          connection.destroy();
        }
        interaction.editReply({ content: "An error occurred while playing the sound." });
      });

      player.play(resource);

      await interaction.editReply({ content: "💨 *burp!*" });

      setTimeout(() => {
        if (connection && connection.state.status !== VoiceConnectionStatus.Destroyed) {
          connection.destroy();
        }
      }, 30_000);
    } catch (error) {
      if (connection && connection.state.status !== VoiceConnectionStatus.Destroyed) {
        connection.destroy();
      }
      return interaction.editReply({
        content: "Sorry, I couldn't join the voice channel or play the sound.",
      });
    }
  },
};
