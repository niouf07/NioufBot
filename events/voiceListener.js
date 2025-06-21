const { Events, EmbedBuilder } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");
const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "../voice-config.json");

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    if (oldState.member.user.bot) return;

    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
    const logChannelId = config[newState.guild.id];
    if (!logChannelId) return;

    let logChannel = newState.guild.channels.cache.get(logChannelId);
    if (!logChannel) {
      try {
        logChannel = await newState.guild.channels.fetch(logChannelId);
      } catch (error) {
        console.error("Log channel not found or inaccessible:", logChannelId);
        return;
      }
    }

    const oldChannel = oldState.channel;
    const newChannel = newState.channel;

    // Helper to send log embed
    const sendLog = async (title, description, color) => {
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp();
      try {
        await logChannel.send({ embeds: [embed] });
      } catch (err) {
        console.error("Failed to send log message:", err);
      }
    };

    if (oldChannel && !newChannel) {
      // User left a voice channel
      await sendLog(
        "🔈 User Left Voice Channel",
        `**${oldState.member.user.tag}** left **${oldChannel.name}**`,
        0xffa500
      );
      return;
    }

    if (!oldChannel && newChannel) {
      // User joined a voice channel
      await sendLog(
        "🔊 User Joined Voice Channel",
        `**${newState.member.user.tag}** joined **${newChannel.name}**`,
        0x57f287
      );
      return;
    }

    if (oldChannel && newChannel && oldChannel.id !== newChannel.id) {
      // User switched voice channels
      await sendLog(
        "🔄 User Switched Voice Channel",
        `**${newState.member.user.tag}** switched from **${oldChannel.name}** to **${newChannel.name}**`,
        0x5865f2
      );
      return;
    }
  },
};
