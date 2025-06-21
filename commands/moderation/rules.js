const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rules")
    .setDescription("Display the server rules in categories")
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
  async execute(interaction) {
    // Category 1: Respect & Behavior
    const respectEmbed = new EmbedBuilder()
      .setTitle("🟣 Server Rules: Respect & Behavior")
      .setColor(0x4b006e)
      .setDescription(
        [
          "**1.1. Be Respectful:** Always treat all members with respect. Personal attacks, harassment, or bullying will not be tolerated.",
          "**1.2. No Discrimination:** Any form of hate speech, racism, sexism, homophobia, or discrimination is strictly forbidden.",
          "**1.3. No NSFW or Inappropriate Content:** Do not share or discuss NSFW, obscene, or otherwise inappropriate content.",
          "**1.4. No Trolling or Provocation:** Do not intentionally provoke, troll, or bait other members or staff.",
        ].join("\n")
      )
      .setFooter({ text: "Respect is the foundation of our community." });

    // Category 2: Chat & Content
    const chatEmbed = new EmbedBuilder()
      .setTitle("🟣 Server Rules: Chat & Content")
      .setColor(0x4b006e)
      .setDescription(
        [
          "**2.1. No Spamming:** Avoid sending repeated messages, emojis, or images. Excessive use of caps is also discouraged.",
          "**2.2. Stay On Topic:** Use each channel for its intended purpose. Off-topic discussions should be kept in designated channels.",
          "**2.3. Speak in the Right Channel:** Only use channels for their intended topics. For example, support questions go in #support, photo in #photo, etc.",
          "**2.4. No Advertising:** Advertising other servers, products, or services is not allowed without staff permission.",
          "**2.5. No Self-Promotion:** Do not promote your own content (YouTube, Twitch, etc.) unless allowed in a specific channel.",
        ].join("\n")
      )
      .setFooter({ text: "Keep the chat clean and relevant." });

    // Category 3: Voice Channels
    const voiceEmbed = new EmbedBuilder()
      .setTitle("🟣 Server Rules: Voice Channels")
      .setColor(0x4b006e)
      .setDescription(
        [
          "**3.1. No Ear Rape or Loud Noises:** Do not use soundboards, play loud music, or intentionally disrupt voice chats.",
          "**3.2. Use Push-to-Talk if Needed:** If you have background noise, please use push-to-talk.",
          "**3.3. Respect Others in Voice:** Do not talk over others or dominate the conversation.",
          "**3.4. No Recording Without Consent:** Do not record voice channels without the consent of all participants.",
        ].join("\n")
      )
      .setFooter({
        text: "Voice channels are for friendly and respectful conversation.",
      });

    // Category 4: Safety & Privacy
    const safetyEmbed = new EmbedBuilder()
      .setTitle("🟣 Server Rules: Safety & Privacy")
      .setColor(0x4b006e)
      .setDescription(
        [
          "**4.1. No Doxxing:** Sharing personal information (yours or others') is strictly prohibited.",
          "**4.2. No Malicious Links:** Do not share suspicious, harmful, or phishing links.",
          "**4.3. Report Issues:** If you see something against the rules or something that makes you uncomfortable, report it to the staff team.",
          "**4.4. Respect Privacy:** Do not ask for or share private conversations without permission.",
        ].join("\n")
      )
      .setFooter({ text: "Your safety and privacy are important to us." });

    // Category 5: Staff & Discord Terms
    const staffEmbed = new EmbedBuilder()
      .setTitle("🟣 Server Rules: Staff & Discord Terms")
      .setColor(0x4b006e)
      .setDescription(
        [
          "**5.1. Follow Staff Instructions:** The staff team’s decisions are final. If you have concerns, discuss them respectfully in private.",
          "**5.2. No Impersonation:** Do not impersonate staff or other members.",
          "**5.3. Follow Discord ToS:** You must comply with [Discord's Terms of Service](https://discord.com/terms) and [Community Guidelines](https://discord.com/guidelines).",
          "**5.4. Rule Updates:** Rules may be updated at any time. It is your responsibility to stay informed.",
        ].join("\n")
      )
      .setFooter({
        text: "Staff are here to help. Please cooperate with them.",
      });

    // Delete the user's command message if possible
    if (interaction.channel && interaction.channel.type === 0) {
      try {
        await interaction.deleteReply?.();
        await interaction.delete?.();
      } catch (e) {
        // Ignore if can't delete
      }
    }

    // Send the rules embeds to the channel (not as a reply)
    await interaction.channel.send({
      embeds: [respectEmbed, chatEmbed, voiceEmbed, safetyEmbed, staffEmbed],
    });
  },
};
