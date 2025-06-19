const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
} = require("discord.js");

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

    for (const [, command] of interaction.client.commands) {
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

    if (Object.keys(categories).length === 0) {
      categories["Other"] = Array.from(interaction.client.commands.values());
    }

    const selectOptions = Object.keys(categories).map((cat) => ({
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      value: cat,
    }));

    function buildEmbed(category) {
      const commands = categories[category];
      return new EmbedBuilder()
        .setTitle(`${category} Commands`)
        .setColor(0x5865f2)
        .setDescription(
          commands
            .map((cmd) => `/${cmd.data.name} - ${cmd.data.description}`)
            .join("\n") || "No commands."
        );
    }

    const selectMenu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("help_category_select")
        .setPlaceholder("Select a category")
        .addOptions(selectOptions)
    );

    const firstCategory = selectOptions[0].value;
    await interaction.reply({
      embeds: [buildEmbed(firstCategory)],
      components: [selectMenu],
    });

    const message = await interaction.fetchReply();

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 900_000,
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        await i.reply({ content: "This menu isn't for you!", ephemeral: true });
        return;
      }
      const selected = i.values[0];
      await i.update({
        embeds: [buildEmbed(selected)],
        components: [selectMenu],
      });
    });

    collector.on("end", async () => {
      selectMenu.components[0].setDisabled(true);
      try {
        await message.edit({
          components: [selectMenu],
        });
      } catch (e) {
        if (e.code !== 10008) {
          console.error("Failed to edit help message:", e);
        }
      }
    });
  },
};
