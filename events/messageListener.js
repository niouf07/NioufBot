const { Events } = require("discord.js");

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;
    const content = message.content.toLowerCase();
    const greetings = [
      "hey",
      "hi",
      "hello",
      "yo",
      "sup",
      "greetings",
      "good morning",
      "good afternoon",
      "good evening",
    ];
    if (greetings.some((greet) => content.includes(greet))) {
      await message.reply("Hey there! 👋");
    }
  },
};
