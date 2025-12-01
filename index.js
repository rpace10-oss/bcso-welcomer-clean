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

    // 👤 user PFP for top-right thumbnail
    const avatarURL = member.user.displayAvatarURL({
      extension: "png",
      size: 256
    });

    const embed = new EmbedBuilder()
      .setTitle("<:bcso:1445119544518643867> Welcome to the Blaine County Sheriff's Office!")
      .setDescription(
        `Hey ${member}, welcome to **BCSO**!\n` +
        `You are our **${memberCount}** member.\n\n` +
        `Use the links below to get started:`
      )
      .addFields(
        { name: "📑 Server Rules", value: rulesChannel, inline: true },
        { name: "🧾 Support & Tickets", value: ticketsChannel, inline: true },
        { name: "👮‍♂️ BCSO Applications", value: appsChannel, inline: true }
      )
      .setColor(0x4B3621) // BCSO brown
      .setThumbnail(avatarURL) // 👈 top-right PFP
      .setImage("https://blazesmods.com/cdn/shop/files/PATROL6.png?v=1721824776&width=1100") // 👈 big bottom image
      .setFooter({
  text: "Blaine County Sheriff's Office • Serve & Protect",
  iconURL: "https://cdn.discordapp.com/attachments/1443657151150166039/1445120501411483771/Normal2.png?ex=692f30d8&is=692ddf58&hm=d3cdaa544514afefe73eed18b48167d51cba0221fb1e9a1b58efc94bbd80c511"
});

    await channel.send({
      content: `Welcome to **BCSO**, ${member}!`,
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
  res.send("BCSO Welcomer bot is running.");
});

app.listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});
