const { Client, Events, GatewayIntentBits } = require("discord.js");
const { token } = require("./config.json");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Event.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
});

client.login(token);
