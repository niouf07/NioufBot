const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tictactoe")
    .setDescription("Play a game of Tic Tac Toe with another user")
    .addUserOption((option) =>
      option
        .setName("opponent")
        .setDescription("The user you want to play against")
        .setRequired(true)
    ),
  async execute(interaction) {
    const opponent = interaction.options.getUser("opponent");
    const player1 = interaction.user;
    const player2 = opponent;

    if (player1.id === player2.id) {
      return interaction.reply({
        content: "You can't play against yourself!",
        flags: 64,
      });
    }
    if (player2.bot) {
      return interaction.reply({
        content: "You can't play against a bot!",
        flags: 64,
      });
    }

    // Initialize board
    let board = Array(9).fill(null);
    let currentPlayer = player1;
    let symbols = { [player1.id]: "❌", [player2.id]: "⭕" };
    let gameOver = false;

    function getBoardComponents() {
      const rows = [];
      for (let i = 0; i < 3; i++) {
        const row = new ActionRowBuilder();
        for (let j = 0; j < 3; j++) {
          const idx = i * 3 + j;
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(`ttt_${idx}`)
              .setLabel(board[idx] ? board[idx] : "·") // Use a visible character for empty cells
              .setStyle(
                board[idx] === "❌"
                  ? ButtonStyle.Danger
                  : board[idx] === "⭕"
                  ? ButtonStyle.Primary
                  : ButtonStyle.Secondary
              )
              .setDisabled(board[idx] !== null || gameOver)
          );
        }
        rows.push(row);
      }
      return rows;
    }

    function checkWinner() {
      const winPatterns = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8], // rows
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8], // cols
        [0, 4, 8],
        [2, 4, 6], // diags
      ];
      for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
          return board[a];
        }
      }
      if (board.every((cell) => cell)) return "draw";
      return null;
    }

    await interaction.reply({
      content: `Tic Tac Toe: ${player1} (❌) vs ${player2} (⭕)\n${currentPlayer}, it's your turn!`,
      components: getBoardComponents(),
    });

    const message = await interaction.fetchReply();

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 5 * 60 * 1000, // 5 minutes
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== currentPlayer.id) {
        await i.reply({ content: "It's not your turn!", flags: 64 });
        return;
      }
      const idx = parseInt(i.customId.split("_")[1]);
      if (board[idx] || gameOver) {
        await i.reply({ content: "Invalid move!", flags: 64 });
        return;
      }
      board[idx] = symbols[currentPlayer.id];
      const winner = checkWinner();
      if (winner === "❌" || winner === "⭕") {
        gameOver = true;
        await i.update({
          content: `Game over! ${currentPlayer} (${symbols[currentPlayer.id]}) wins!`,
          components: getBoardComponents(),
        });
        collector.stop();
      } else if (winner === "draw") {
        gameOver = true;
        await i.update({
          content: `It's a draw!`,
          components: getBoardComponents(),
        });
        collector.stop();
      } else {
        currentPlayer = currentPlayer.id === player1.id ? player2 : player1;
        await i.update({
          content: `Tic Tac Toe: ${player1} (❌) vs ${player2} (⭕)\n${currentPlayer}, it's your turn!`,
          components: getBoardComponents(),
        });
      }
    });

    collector.on("end", async () => {
      if (!gameOver) {
        // Disable all buttons when the game ends due to inactivity
        const disabledRows = getBoardComponents().map((row) => {
          row.components.forEach((btn) => btn.setDisabled(true));
          return row;
        });
        await message.edit({
          content: "Game ended due to inactivity.",
          components: disabledRows,
        });
      }
    });
  },
};
