const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Ask the magic 8-ball a question")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("Your question for the magic 8-ball")
        .setRequired(true)
    ),
  async execute(interaction) {
    const question = interaction.options.getString("question");
    const responses = [
      "Yes",
      "No",
      "Maybe",
      "Ask again later",
      "Definitely",
      "Absolutely not",
      "It is certain",
      "Very doubtful",
      "Without a doubt",
      "My sources say no",
    ];
    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)];

    const embed = new EmbedBuilder()
      .setTitle("🎱 Magic 8-Ball")
      .setColor(0x6c3483)
      .setDescription("Ask your question and receive the wisdom of the 8-ball!")
      .setThumbnail(
        "https://cdn.discordapp.com/emojis/1228768366044684379.png"
      ) // You can use any 8-ball image or your bot's avatar
      .addFields(
        { name: "Question", value: `*${question}*`, inline: false },
        { name: "Answer", value: `**${randomResponse}**`, inline: false }
      )
      .setFooter({
        text: "The 8-ball knows all...",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
