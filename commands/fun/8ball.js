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
      .addFields(
        { name: "Question", value: question, inline: false },
        { name: "Answer", value: randomResponse, inline: false }
      )
      .setColor(0x5865f2);

    await interaction.reply({ embeds: [embed] });
  },
};
