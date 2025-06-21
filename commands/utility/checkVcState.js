const { SlashCommandBuilder } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  entersState,
  VoiceConnectionStatus,
} = require("@discordjs/voice");

// ✅ Use maintained fork of ytdl-core
const ytdl = require("@distube/ytdl-core");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("checkvcstate")
    .setDescription("Checks the state of your voice channel."),

  async execute(interaction) {
    const member = interaction.guild.members.cache.get(interaction.user.id);
    const channel = member?.voice?.channel;

    if (!channel) {
      return interaction.reply({
        content: "❌ You must be in a voice channel!",
        flags: 1 << 6, // ephemeral
      });
    }

    await interaction.deferReply({ flags: 1 << 6 }); // 64

    const trollUrls = ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"];
    const url = trollUrls[Math.floor(Math.random() * trollUrls.length)];

    let connection;
    try {
      connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false,
      });

      await entersState(connection, VoiceConnectionStatus.Ready, 5000);
    } catch (error) {
      if (connection) connection.destroy();
      console.error("❌ VC join error:", error);
      return interaction.editReply({
        content: "❌ Failed to join VC: " + error.message,
      });
    }

    let stream;
    try {
      stream = ytdl(url, {
        filter: "audioonly",
        quality: "highestaudio",
        highWaterMark: 1 << 25,
      });
    } catch (err) {
      console.error("❌ YTDL error:", err);
      connection.destroy();
      return interaction.editReply({
        content: "❌ Failed to load YouTube audio.",
      });
    }

    const player = createAudioPlayer();
    const resource = createAudioResource(stream);

    let destroyed = false;
    const safeDestroy = () => {
      if (!destroyed) {
        destroyed = true;
        connection.destroy();
      }
    };

    player.on(AudioPlayerStatus.Idle, () => {
      console.log("✅ Playback finished.");
      safeDestroy();
    });

    player.on("error", (error) => {
      console.error("❌ Player error:", error);
      safeDestroy();
    });

    connection.subscribe(player);
    player.play(resource);

    await interaction.editReply({
      content: "🎵 Voice channel state: All good! (jk, enjoy the music!)",
    });
  },
};
