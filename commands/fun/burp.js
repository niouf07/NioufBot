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
    const channel = interaction.member.voice.channel;
    if (!channel) {
      return interaction.reply({ content: "Join a VC first!", flags: 64 });
    }
    await interaction.deferReply({ flags: 64 });

    let connection;
    try {
      connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false,
      });
      await entersState(connection, VoiceConnectionStatus.Ready, 5_000);
      console.log("Joined VC successfully!");
    } catch (error) {
      if (connection) connection.destroy();
      console.error("Failed to join VC:", error);
      return interaction.editReply({ content: "Failed to join VC: " + error });
    }

    const player = createAudioPlayer();
    const resource = createAudioResource(
      path.join(__dirname, "..", "..", "sounds", "burp.wav")
    );

    player.on(AudioPlayerStatus.Playing, () => {
      console.log("AudioPlayer is playing!");
    });

    player.on(AudioPlayerStatus.Idle, () => {
      console.log("Playback finished, leaving VC.");
      connection.destroy();
    });

    player.on("error", (error) => {
      console.error("Audio player error:", error);
      connection.destroy();
    });

    connection.subscribe(player);
    player.play(resource);

    await interaction.editReply({ content: "Playing burp sound in VC!" });
  },
};
