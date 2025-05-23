const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get a list of available commands"),
  async execute(interaction) {
    const categories = {};
    const categoryMap = {
      utility: "Utility",
      moderation: "Moderation",
    };

    for (const [name, command] of interaction.client.commands) {
      let category = "Other";
      if (command.category) {
        const folder = command.category.toLowerCase();
        category =
          categoryMap[folder] ||
          folder.charAt(0).toUpperCase() + folder.slice(1);
      }
      if (!categories[category]) categories[category] = [];
      categories[category].push(command);
    }

    // If no filePath or category, fallback to all commands in "Other"
    if (Object.keys(categories).length === 0) {
      categories["Other"] = Array.from(interaction.client.commands.values());
    }

    const embed = new EmbedBuilder()
      .setTitle("Available Commands")
      .setColor(0x5865f2)
      .setDescription(
        "Here are all the available commands, grouped by category:"
      );

    for (const [category, commands] of Object.entries(categories)) {
      embed.addFields({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value:
          commands
            .map((cmd) => `/${cmd.data.name} - ${cmd.data.description}`)
            .join("\n") || "No commands.",
      });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
