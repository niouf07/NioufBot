const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
  ButtonBuilder,
  ButtonStyle,
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

    const canSeeModeration =
      interaction.member.permissions.has("ModerateMembers") ||
      interaction.member.permissions.has("Administrator");

    for (const [, command] of interaction.client.commands) {
      let category = "Other";
      if (command.category) {
        const folder = command.category.toLowerCase();
        category =
          categoryMap[folder] ||
          folder.charAt(0).toUpperCase() + folder.slice(1);
      }
      if (category === "Moderation" && !canSeeModeration) continue;
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
      const embed = new EmbedBuilder()
        .setTitle(`✨ ${category} Commands`)
        .setColor(0x6c3483)
        .setDescription(
          `Here are the available **${category.toLowerCase()}** commands.`
        )
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setFooter({
          text: "Use the menu below to view other categories.",
        })
        .setTimestamp();

      if (commands.length) {
        for (const cmd of commands) {
          embed.addFields({
            name: `</${cmd.data.name}:0>`,
            value: cmd.data.description
              ? `*${cmd.data.description}*`
              : "No description.",
            inline: false,
          });
        }
      } else {
        embed.addFields({
          name: "No commands in this category.",
          value: "\u200b",
          inline: false,
        });
      }
      return embed;
    }

    // Intro embed
    const introEmbed = new EmbedBuilder()
      .setTitle("❓ How to use the Help Menu")
      .setColor(0x6c3483)
      .setDescription(
        "Welcome to the help menu!\n\n" +
          "• Use the dropdown menu on the next page to browse command categories.\n" +
          "• Select a category to see all commands in it, with descriptions.\n" +
          "• Only categories you have permission to view are shown.\n\n" +
          "Click **Continue** to view the command categories!"
      )
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setFooter({
        text: "Use the Continue button below.",
      })
      .setTimestamp();

    const continueButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("help_continue")
        .setLabel("Continue")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      embeds: [introEmbed],
      components: [continueButton],
    });

    const message = await interaction.fetchReply();

    const filter = (i) =>
      i.user.id === interaction.user.id && i.customId === "help_continue";

    const collector = message.createMessageComponentCollector({
      filter,
      componentType: ComponentType.Button,
      time: 120_000,
      max: 1,
    });

    collector.on("collect", async (i) => {
      const selectMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("help_category_select")
          .setPlaceholder("Select a category")
          .addOptions(selectOptions)
      );

      const firstCategory = selectOptions[0].value;
      try {
        await i.update({
          embeds: [buildEmbed(firstCategory)],
          components: [selectMenu],
        });
      } catch (e) {
        console.error("Failed to update to select menu:", e);
        return;
      }

      const menuMessage = await i.fetchReply();

      const menuCollector = menuMessage.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 900_000,
      });

      menuCollector.on("collect", async (selectInt) => {
        if (selectInt.user.id !== interaction.user.id) {
          await selectInt.reply({ content: "This menu isn't for you!" });
          return;
        }
        const selected = selectInt.values[0];
        try {
          await selectInt.update({
            embeds: [buildEmbed(selected)],
            components: [selectMenu],
          });
        } catch (e) {
          console.error("Failed to update select menu:", e);
        }
      });

      menuCollector.on("end", async () => {
        selectMenu.components[0].setDisabled(true);
        try {
          await menuMessage.edit({
            components: [selectMenu],
          });
        } catch (e) {
          if (e.code !== 10008) {
            console.error("Failed to edit help message:", e);
          }
        }
      });
    });

    collector.on("end", async (_, reason) => {
      // Only disable the button if it wasn't already replaced by the select menu
      if (reason === "time") {
        continueButton.components[0].setDisabled(true);
        try {
          await message.edit({
            components: [continueButton],
          });
        } catch (e) {
          if (e.code !== 10008) {
            console.error("Failed to edit intro help message:", e);
          }
        }
      }
    });
  },
};
