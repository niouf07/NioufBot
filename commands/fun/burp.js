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
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    const filePath = path.join(__dirname, "..", "..", "sounds", "burp.mp3");
    const resource = createAudioResource(filePath);
    const player = createAudioPlayer();

    connection.subscribe(player);

    connection.on("stateChange", (oldState, newState) => {
      console.log(
        `Voice connection state changed from ${oldState.status} to ${newState.status}`
      );
    });

    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 5_000);
      player.play(resource);
    } catch (error) {
      console.error("Voice connection error:", error);
      connection.destroy();
      return interaction.editReply({
        content: "Failed to join voice channel!",
      });
    }

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });

    player.on("error", (error) => {
      connection.destroy();
    });

    setTimeout(() => {
      try {
        connection.destroy();
      } catch {}
    }, 10000);

    await interaction.editReply({ content: "💨 *burp!*" });
  },
};
