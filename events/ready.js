const { Events, ActivityType } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    client.user.setActivity("https://discord.gg/EFmUytQczm", {
      type: ActivityType.Watching,
    });
    console.log(`${client.user.tag} is online!`);
  },
};
