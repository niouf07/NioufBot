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

    const db = message.client.db;
    if (db) {
      const userID = message.author.id;
      const guildID = message.guild?.id;
      if (guildID) {
        // Always upsert user row (if not exists, insert with 0 XP/1 level; if exists, do nothing)
        db.query(
          `INSERT INTO level (userID, guildID, experience, level) VALUES (?, ?, 0, 1)
           ON DUPLICATE KEY UPDATE userID = userID`,
          [userID, guildID],
          (err) => {
            if (err) {
              console.error("Failed to upsert user row:", err);
            }
          }
        );

        // Give random XP between 10 and 20, then check for level up
        const xpGain = Math.floor(Math.random() * 11) + 10;
        db.query(
          `UPDATE level SET experience = experience + ? WHERE userID = ? AND guildID = ?`,
          [xpGain, userID, guildID],
          (err) => {
            if (err) {
              console.error("Failed to update user experience:", err);
            } else {
              // Fetch the updated experience and level
              db.query(
                `SELECT experience, level FROM level WHERE userID = ? AND guildID = ?`,
                [userID, guildID],
                (err2, results) => {
                  if (!err2 && results && results[0]) {
                    let experience = Number(results[0].experience);
                    let level = Number(results[0].level);
                    let leveledUp = false;
                    let nextLevelXp = 100 * level;
                    while (experience >= nextLevelXp) {
                      experience -= nextLevelXp;
                      level += 1;
                      leveledUp = true;
                      nextLevelXp = 100 * level;
                    }
                    if (leveledUp) {
                      db.query(
                        `UPDATE level SET level = ?, experience = ? WHERE userID = ? AND guildID = ?`,
                        [level, experience, userID, guildID],
                        (err3) => {
                          if (!err3) {
                            message.channel.send(
                              `<@${userID}> leveled up to level ${level}! 🎉`
                            );
                          }
                        }
                      );
                    }
                  }
                }
              );
            }
          }
        );
      }
    }
  },
};
