require("dotenv").config();
const express = require("express");

const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder
} = require("discord.js");

// Create the client with member intent so we get join events
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.GuildMember]
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Runs every time someone joins the server
client.on("guildMemberAdd", async (member) => {
  try {
    if (member.user.bot) return;

    // =========================
    // 1. Auto-role
    // =========================
    const roleId = process.env.AUTOROLE_ID;
    const role = member.guild.roles.cache.get(roleId);

    if (role) {
      await member.roles.add(role).catch(console.error);
    } else {
      console.warn(`Auto-role ID ${roleId} not found in guild ${member.guild.id}`);
    }

    // =========================
    // 2. Welcome Embed
    // =========================
    const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
    const channel = member.guild.channels.cache.get(welcomeChannelId);

    if (!channel) {
      console.warn(`Welcome channel ${welcomeChannelId} not found.`);
      return;
    }

    const rulesChannelId   = process.env.RULES_CHANNEL_ID;
    const ticketsChannelId = process.env.TICKETS_CHANNEL_ID;
    const appsChannelId    = process.env.APPLICATIONS_CHANNEL_ID;

    const rulesChannel   = rulesChannelId   ? `<#${rulesChannelId}>`   : "Not set";
    const ticketsChannel = ticketsChannelId ? `<#${ticketsChannelId}>` : "Not set";
    const appsChannel    = appsChannelId    ? `<#${appsChannelId}>`    : "Not set";

    const memberCount = member.guild.memberCount;

    const embed = new EmbedBuilder()
      // 🔹 Custom SASO emoji in title
      .setTitle("<:saso:1445797457509355582> Welcome to the San Andreas Sheriff's Office!")
      .setDescription(
        `Hey ${member}, welcome to **SASO**!\n` +
        `You are our **${memberCount}** member.\n\n` +
        `Use the links below to get started:`
      )
      .addFields(
        { name: "📑 Server Rules", value: rulesChannel, inline: true },
        { name: "🧾 Support & Tickets", value: ticketsChannel, inline: true },
        { name: "👮‍♂️ SASO Applications", value: appsChannel, inline: true }
      )
      .setColor(0x4B3621) // SASO brown

      // 🔹 Thumbnail = your badge icon
      .setThumbnail("https://cdn.discordapp.com/attachments/1443657155831009359/1445780848484941904/Adobe_Express_-_file_1.png?ex=693197d7&is=69304657&hm=2e1e408ae6d524d444fcdaf2d1ab5f065047c75b7374e1bf27f872ee8bf41c5d&")

      // 🔹 Big SASO image at the bottom
      .setImage("https://recklemodifications.com/cdn/shop/files/FiveM_b3095_GTAProcess2025-07-2614-04-32_266.png?v=1759722740&width=713")

      // 🔹 Footer with badge icon (bottom-left)
      .setFooter({
        text: "San Andreas Sheriff's Office • Serve & Protect",
        iconURL: "https://cdn.discordapp.com/attachments/1443657155831009359/1445780848484941904/Adobe_Express_-_file_1.png?ex=693197d7&is=69304657&hm=2e1e408ae6d524d444fcdaf2d1ab5f065047c75b7374e1bf27f872ee8bf41c5d&"
      });

    await channel.send({
      content: `Welcome to **SASO**, ${member}!`,
      embeds: [embed]
    });

  } catch (err) {
    console.error("Error in guildMemberAdd:", err);
  }
});

// Log the bot in
client.login(process.env.DISCORD_TOKEN);

// =========================
// Simple HTTP server for Render / UptimeRobot
// =========================
const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("SASO Welcomer bot is running.");
});

app.listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});
