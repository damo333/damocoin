import { GECKO_API } from './constants.js';

export async function fetchPrice() {
  try {
    const res = await fetch(GECKO_API, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) return null;
    const data = await res.json();
    const attrs = data?.data?.attributes;
    if (!attrs) return null;
    return {
      priceUsd: parseFloat(attrs.base_token_price_usd || 0),
      priceChange24h: parseFloat(attrs.price_change_percentage?.h24 || 0),
      volume24h: parseFloat(attrs.volume_usd?.h24 || 0),
      liquidity: parseFloat(attrs.reserve_in_usd || 0),
      marketCap: parseFloat(attrs.market_cap_usd || attrs.fdv_usd || 0),
    };
  } catch {
    return null;
  }
}

export function formatPrice(p) {
  if (!p) return 'Price unavailable';
  const sign = p.priceChange24h >= 0 ? '+' : '';
  return [
    `💰 **$DAMO Price**: $${p.priceUsd.toFixed(8)}`,
    `📈 **24h Change**: ${sign}${p.priceChange24h.toFixed(2)}%`,
    `💧 **Liquidity**: $${(p.liquidity / 1000).toFixed(1)}K`,
    `📊 **24h Volume**: $${(p.volume24h / 1000).toFixed(1)}K`,
  ].join('\n');
}
