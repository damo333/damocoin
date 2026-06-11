export const DAMO_MINT = 'DPbc8tyMmEc5NKiLnJQQZhuLErwL6A7SwKomFKV4z2Vx';
export const GECKO_POOL = 'GoCdYw89tdncWdXp2j18i7db34EcktXeFEh4uE4dZwCW';
export const GECKO_API = `https://api.geckoterminal.com/api/v2/networks/solana/pools/${GECKO_POOL}`;
export const WEBSITE = 'https://damo333.github.io/damocoin/';
export const RAYDIUM_URL = `https://raydium.io/swap/?inputCurrency=sol&outputCurrency=${DAMO_MINT}`;
export const GECKO_URL = `https://www.geckoterminal.com/solana/pools/${GECKO_POOL}`;

export const DAMO_CONTEXT = `
DamoCoin (DAMO) is a Solana SPL token on mainnet.
- Mint: ${DAMO_MINT}
- Total supply: 1,000,000,000 DAMO
- Network: Solana (fast, low fees)
- Trading: Raydium DEX
- Website: ${WEBSITE}
- Buy link: ${RAYDIUM_URL}
- Chart: ${GECKO_URL}

Tone: confident, community-driven, crypto-native but not overly hyped.
Avoid making price predictions or financial advice.
Keep messages punchy, use crypto slang naturally (gm, wagmi, LFG, ser, based, alpha, degen).
Always include relevant links when appropriate.
`.trim();
