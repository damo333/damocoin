import {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
  MessageFlags,
} from 'discord.js';
import dotenv from 'dotenv';
import { generateContent, CONTENT_LABELS } from './generate.js';
import { fetchPrice, formatPrice } from './price.js';
import { GECKO_URL, RAYDIUM_URL, WEBSITE } from './constants.js';

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('clientReady', () => {
  console.log(`DamoCoin bot online as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    await handleCommand(interaction);
  } else if (interaction.isButton()) {
    await handleButton(interaction);
  }
});

async function handleCommand(interaction) {
  const { commandName } = interaction;

  if (commandName === 'price') {
    await interaction.deferReply();
    const price = await fetchPrice();
    if (!price) {
      await interaction.editReply('Could not fetch price data right now. Try again shortly.');
      return;
    }
    const embed = new EmbedBuilder()
      .setTitle('$DAMO Live Price')
      .setDescription(formatPrice(price))
      .setColor(price.priceChange24h >= 0 ? 0x00ff88 : 0xff4444)
      .addFields(
        { name: 'Chart', value: `[GeckoTerminal](${GECKO_URL})`, inline: true },
        { name: 'Buy', value: `[Raydium](${RAYDIUM_URL})`, inline: true },
        { name: 'Website', value: `[damocoin](${WEBSITE})`, inline: true },
      )
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
    return;
  }

  if (commandName === 'help') {
    const embed = new EmbedBuilder()
      .setTitle('DamoCoin Marketing Bot')
      .setDescription('Generate AI-powered content for DamoCoin promotion.')
      .setColor(0x9945ff)
      .addFields(
        { name: '/generate tweet', value: 'Generate a tweet to copy-paste to Twitter' },
        { name: '/generate announcement', value: 'Generate a Discord community announcement' },
        { name: '/generate price-update', value: 'Generate a live price update post' },
        { name: '/generate alpha', value: 'Generate an alpha drop hype post' },
        { name: '/generate gm', value: 'Generate a GM community post' },
        { name: '/price', value: 'Show live $DAMO price' },
        { name: 'Optional: note', value: 'Add extra context for Claude in any /generate command' },
      );
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    return;
  }

  if (commandName === 'generate') {
    const type = interaction.options.getString('type');
    const note = interaction.options.getString('note') || '';

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    let result;
    try {
      result = await generateContent(type, note);
    } catch (err) {
      console.error('Generation error:', err);
      await interaction.editReply('Failed to generate content. Check your API key and try again.');
      return;
    }

    const isTweet = type === 'tweet';
    const targetChannel = process.env.DISCORD_CHANNEL_ID;

    const previewEmbed = new EmbedBuilder()
      .setTitle(`Preview: ${result.label}`)
      .setDescription(`\`\`\`\n${result.text}\n\`\`\``)
      .setColor(0x9945ff)
      .setFooter({ text: isTweet ? 'Tweet — copy and paste to Twitter' : `Will post to <#${targetChannel}>` });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`approve:${type}:${Buffer.from(result.text).toString('base64url')}`)
        .setLabel(isTweet ? 'Copy text (mark as used)' : 'Post to #general')
        .setStyle(isTweet ? ButtonStyle.Success : ButtonStyle.Primary)
        .setEmoji(isTweet ? '📋' : '📢'),
      new ButtonBuilder()
        .setCustomId(`regenerate:${type}:${encodeURIComponent(note)}`)
        .setLabel('Regenerate')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔄'),
      new ButtonBuilder()
        .setCustomId('discard')
        .setLabel('Discard')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🗑️'),
    );

    await interaction.editReply({
      content: `Generated for you — review before ${isTweet ? 'tweeting' : 'posting'}:`,
      embeds: [previewEmbed],
      components: [row],
    });
  }
}

async function handleButton(interaction) {
  const [action, ...parts] = interaction.customId.split(':');

  if (action === 'discard') {
    await interaction.update({ content: 'Discarded.', embeds: [], components: [] });
    return;
  }

  if (action === 'regenerate') {
    const [type, encodedNote] = parts;
    const note = decodeURIComponent(encodedNote || '');
    await interaction.deferUpdate();
    let result;
    try {
      result = await generateContent(type, note);
    } catch (err) {
      await interaction.editReply({ content: 'Regeneration failed.', embeds: [], components: [] });
      return;
    }
    const isTweet = type === 'tweet';
    const targetChannel = process.env.DISCORD_CHANNEL_ID;
    const previewEmbed = new EmbedBuilder()
      .setTitle(`Preview: ${result.label}`)
      .setDescription(`\`\`\`\n${result.text}\n\`\`\``)
      .setColor(0x9945ff)
      .setFooter({ text: isTweet ? 'Tweet — copy and paste to Twitter' : `Will post to <#${targetChannel}>` });
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`approve:${type}:${Buffer.from(result.text).toString('base64url')}`)
        .setLabel(isTweet ? 'Copy text (mark as used)' : 'Post to #general')
        .setStyle(isTweet ? ButtonStyle.Success : ButtonStyle.Primary)
        .setEmoji(isTweet ? '📋' : '📢'),
      new ButtonBuilder()
        .setCustomId(`regenerate:${type}:${encodedNote}`)
        .setLabel('Regenerate')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔄'),
      new ButtonBuilder()
        .setCustomId('discard')
        .setLabel('Discard')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🗑️'),
    );
    await interaction.editReply({ content: 'Regenerated:', embeds: [previewEmbed], components: [row] });
    return;
  }

  if (action === 'approve') {
    const [type, encodedText] = parts;
    const text = Buffer.from(encodedText, 'base64url').toString();
    const isTweet = type === 'tweet';

    if (isTweet) {
      // For tweets: show the clean text for easy copy-paste
      await interaction.update({
        content: `Tweet ready to copy:\n\n${text}\n\n*Go paste this into Twitter/X*`,
        embeds: [],
        components: [],
      });
      return;
    }

    // For Discord posts: post to the target channel
    const targetChannel = process.env.DISCORD_CHANNEL_ID;
    try {
      const channel = await client.channels.fetch(targetChannel);
      if (!channel?.isTextBased()) throw new Error('Channel not found or not text-based');
      await channel.send(text);
      await interaction.update({
        content: `Posted to <#${targetChannel}>`,
        embeds: [],
        components: [],
      });
    } catch (err) {
      console.error('Post error:', err);
      await interaction.update({
        content: `Failed to post: ${err.message}`,
        embeds: [],
        components: [],
      });
    }
  }
}

client.login(process.env.DISCORD_BOT_TOKEN);
