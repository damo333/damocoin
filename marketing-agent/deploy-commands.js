import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const commands = [
  new SlashCommandBuilder()
    .setName('generate')
    .setDescription('Generate DamoCoin marketing content with Claude AI')
    .addStringOption(opt =>
      opt.setName('type')
        .setDescription('Type of content to generate')
        .setRequired(true)
        .addChoices(
          { name: 'Tweet (for copy-paste to Twitter)', value: 'tweet' },
          { name: 'Discord Announcement', value: 'announcement' },
          { name: 'Price Update', value: 'price-update' },
          { name: 'Alpha Drop', value: 'alpha' },
          { name: 'GM Post', value: 'gm' },
        )
    )
    .addStringOption(opt =>
      opt.setName('note')
        .setDescription('Optional: extra context for Claude (e.g. "mention the new website")')
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('price')
    .setDescription('Show live $DAMO price from GeckoTerminal'),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show DamoCoin bot commands'),
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

try {
  console.log('Registering slash commands...');
  await rest.put(
    Routes.applicationGuildCommands(
      process.env.DISCORD_CLIENT_ID,
      process.env.DISCORD_GUILD_ID
    ),
    { body: commands }
  );
  console.log('Slash commands registered successfully.');
} catch (err) {
  console.error(err);
}
