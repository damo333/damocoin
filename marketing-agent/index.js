import {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
} from 'discord.js';
import dotenv from 'dotenv';
import { generateContent } from './generate.js';
import { fetchPrice, formatPrice } from './price.js';
import { GECKO_URL, RAYDIUM_URL, WEBSITE } from './constants.js';

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Drafts awaiting approval, keyed by short ID (Discord customIds max 100 chars,
// so content can't be embedded in the button itself)
const drafts = new Map();
let draftCounter = 0;
const DRAFT_TTL_MS = 60 * 60 * 1000;

function storeDraft(result, note) {
  const id = String(++draftCounter);
  drafts.set(id, { ...result, note, createdAt: Date.now() });
  setTimeout(() => drafts.delete(id), DRAFT_TTL_MS).unref?.();
  return id;
}

function buildPreview(draftId, draft) {
  const isTweet = draft.type === 'tweet';
  const targetChannel = process.env.DISCORD_CHANNEL_ID;

  const embed = new EmbedBuilder()
    .setTitle(`Preview: ${draft.label}`)
    .setDescription(`\`\`\`\n${draft.text}\n\`\`\``)
    .setColor(0x9945ff)
    .setFooter({ text: isTweet ? 'Tweet — copy and paste to Twitter' : 'Will post to #general' });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`approve:${draftId}`)
      .setLabel(isTweet ? 'Show tweet to copy' : 'Post to #general')
      .setStyle(isTweet ? ButtonStyle.Success : ButtonStyle.Primary)
      .setEmoji(isTweet ? '📋' : '📢'),
    new ButtonBuilder()
      .setCustomId(`regenerate:${draftId}`)
      .setLabel('Regenerate')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('🔄'),
    new ButtonBuilder()
      .setCustomId(`discard:${draftId}`)
      .setLabel('Discard')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🗑️'),
  );

  return { embeds: [embed], components: [row] };
}

client.once('clientReady', () => {
  console.log(`DamoCoin bot online as ${client.user.tag}`);
  scheduleDailyGm();
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

    const draftId = storeDraft(result, note);
    await interaction.editReply({
      content: 'Review before approving:',
      ...buildPreview(draftId, drafts.get(draftId)),
    });
  }
}

async function handleButton(interaction) {
  const [action, draftId] = interaction.customId.split(':');

  if (action === 'discard') {
    drafts.delete(draftId);
    await interaction.update({ content: 'Discarded.', embeds: [], components: [] });
    return;
  }

  const draft = drafts.get(draftId);
  if (!draft) {
    await interaction.update({
      content: 'This draft has expired (drafts are kept for 1 hour). Run /generate again.',
      embeds: [],
      components: [],
    });
    return;
  }

  if (action === 'regenerate') {
    await interaction.deferUpdate();
    let result;
    try {
      result = await generateContent(draft.type, draft.note);
    } catch (err) {
      console.error('Regeneration error:', err);
      await interaction.editReply({ content: 'Regeneration failed.', embeds: [], components: [] });
      return;
    }
    drafts.delete(draftId);
    const newId = storeDraft(result, draft.note);
    await interaction.editReply({
      content: 'Regenerated:',
      ...buildPreview(newId, drafts.get(newId)),
    });
    return;
  }

  if (action === 'approve') {
    drafts.delete(draftId);

    if (draft.type === 'tweet') {
      // Show the clean text for easy copy-paste
      await interaction.update({
        content: `Tweet ready to copy:\n\n${draft.text}\n\n*Go paste this into Twitter/X*`,
        embeds: [],
        components: [],
      });
      return;
    }

    const targetChannel = process.env.DISCORD_CHANNEL_ID;
    try {
      const channel = await client.channels.fetch(targetChannel);
      if (!channel?.isTextBased()) throw new Error('Channel not found or not text-based');
      await channel.send(draft.text);
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

// ── Daily GM draft ──
// Each morning, generates a GM post and DMs it to the owner with the usual
// approve/regenerate/discard buttons. Approving posts it to #general.
function scheduleDailyGm() {
  const ownerId = process.env.DISCORD_OWNER_ID;
  if (!ownerId) {
    console.log('DISCORD_OWNER_ID not set — daily GM drafts disabled.');
    return;
  }
  const hour = parseInt(process.env.DAILY_GM_HOUR || '9', 10);

  const msUntilNext = () => {
    const next = new Date();
    next.setHours(hour, 0, 0, 0);
    if (next <= new Date()) next.setDate(next.getDate() + 1);
    return next - new Date();
  };

  const run = async () => {
    try {
      await sendGmDraft(ownerId);
    } catch (err) {
      console.error('Daily GM draft error:', err);
    }
    setTimeout(run, msUntilNext());
  };

  setTimeout(run, msUntilNext());
  console.log(`Daily GM draft scheduled for ${hour}:00 (in ${Math.round(msUntilNext() / 60000)} min).`);
}

async function sendGmDraft(ownerId) {
  const result = await generateContent('gm');
  const draftId = storeDraft(result, '');
  const owner = await client.users.fetch(ownerId);
  await owner.send({
    content: 'Your daily GM draft is ready — approve to post it to #general:',
    ...buildPreview(draftId, drafts.get(draftId)),
  });
  console.log('Daily GM draft sent to owner.');
}

client.login(process.env.DISCORD_BOT_TOKEN);
