import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { DAMO_CONTEXT, RAYDIUM_URL, GECKO_URL, WEBSITE } from './constants.js';
import { fetchPrice, formatPrice } from './price.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TYPES = {
  tweet: {
    label: 'Tweet',
    prompt: (priceBlock) => `Generate a crypto Twitter tweet about DamoCoin ($DAMO).
${priceBlock}
Rules:
- Max 280 characters total
- Include $DAMO cashtag
- One or two relevant emojis
- No financial advice
- End with the buy link: ${RAYDIUM_URL}
- Output ONLY the tweet text, nothing else`,
  },
  announcement: {
    label: 'Discord Announcement',
    prompt: (priceBlock) => `Generate a Discord community announcement for DamoCoin ($DAMO).
${priceBlock}
Rules:
- 2-4 sentences, enthusiastic but not spammy
- Include relevant links (buy: ${RAYDIUM_URL} | chart: ${GECKO_URL} | site: ${WEBSITE})
- Use Discord markdown (bold, etc.) sparingly
- No financial advice
- Output ONLY the announcement text, nothing else`,
  },
  'price-update': {
    label: 'Price Update',
    prompt: (priceBlock) => `Generate a short Discord price update message for DamoCoin.
${priceBlock}
Rules:
- Lead with the live price data above in a clean format
- Add one line of community hype
- Include chart link: ${GECKO_URL}
- No financial advice
- Output ONLY the message text, nothing else`,
  },
  alpha: {
    label: 'Alpha Drop',
    prompt: () => `Generate a "DAMO alpha drop" message for a Discord crypto community.
Rules:
- Tease something exciting about the project or community growth
- Mysterious/hyped tone, 2-3 sentences
- Include website: ${WEBSITE}
- No financial advice or price claims
- Output ONLY the message text, nothing else`,
  },
  gm: {
    label: 'GM Post',
    prompt: (priceBlock) => `Generate a morning "GM" (good morning) community post for DamoCoin Discord.
${priceBlock}
Rules:
- Start with "gm" or "GM"
- Upbeat, welcoming, community-focused
- 1-3 sentences
- Maybe include a motivational crypto phrase
- No financial advice
- Output ONLY the message text, nothing else`,
  },
};

export const CONTENT_TYPES = Object.keys(TYPES);
export const CONTENT_LABELS = Object.fromEntries(
  Object.entries(TYPES).map(([k, v]) => [k, v.label])
);

export async function generateContent(type, customNote = '') {
  const spec = TYPES[type];
  if (!spec) throw new Error(`Unknown content type: ${type}`);

  const priceData = await fetchPrice();
  const priceBlock = priceData
    ? `Current live data:\n${formatPrice(priceData)}`
    : '';

  const userPrompt = spec.prompt(priceBlock)
    + (customNote ? `\n\nExtra context from user: ${customNote}` : '');

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: `You are a crypto marketing assistant for DamoCoin. Context:\n${DAMO_CONTEXT}`,
    messages: [{ role: 'user', content: userPrompt }],
  });

  return {
    text: msg.content[0].text.trim(),
    priceData,
    type,
    label: spec.label,
  };
}
