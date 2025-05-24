const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('givexp')
        .setDescription('Gives a user experience points')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to give experience points to')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('The amount of experience points to give')
                .setRequired(true)),

    async execute(interaction) {
        const db = interaction.client.db;
        if (!db) {
            return interaction.reply({ content: 'Database connection is not available.', flags: 64 });
        }

        const user = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        if (amount <= 0) {
            return interaction.reply({ content: 'You must give a positive amount of experience points.', flags: 64 });
        }

        const userID = user.id;
        const guildID = interaction.guild.id;

        // Upsert user row
        db.query(
            `INSERT INTO level (userID, guildID, experience, level) VALUES (?, ?, 0, 1)
             ON DUPLICATE KEY UPDATE userID = userID`,
            [userID, guildID],
            (err) => {
                if (err) {
                    console.error("Failed to upsert user row:", err);
                    return interaction.reply({ content: 'Failed to update user data.', flags: 64 });
                }

                // Fetch current experience and level
                db.query(
                    `SELECT experience, level FROM level WHERE userID = ? AND guildID = ?`,
                    [userID, guildID],
                    (err2, results) => {
                        if (err2 || !results || !results[0]) {
                            console.error("Failed to fetch user data:", err2);
                            return interaction.reply({ content: 'Failed to fetch user data.', flags: 64 });
                        }

                        let experience = Number(results[0].experience) + amount;
                        let level = Number(results[0].level);
                        let leveledUp = false;
                        let nextLevelXp = 100 * level;

                        while (experience >= nextLevelXp) {
                            experience -= nextLevelXp;
                            level += 1;
                            leveledUp = true;
                            nextLevelXp = 100 * level;
                        }

                        db.query(
                            `UPDATE level SET experience = ?, level = ? WHERE userID = ? AND guildID = ?`,
                            [experience, level, userID, guildID],
                            (err3) => {
                                if (err3) {
                                    console.error("Failed to update user experience/level:", err3);
                                    return interaction.reply({ content: 'Failed to update user experience/level.', flags: 64 });
                                }
                                if (leveledUp) {
                                    return interaction.reply({ content: `<@${userID}> leveled up to level ${level}! 🎉` });
                                } else {
                                    return interaction.reply({ content: `Gave ${amount} XP to <@${userID}>.` });
                                }
                            }
                        );
                    }
                );
            }
        );
    }
};