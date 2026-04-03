import { CRYPTO_IDS, STOCKS_DB } from '@/lib/data';
import { NextResponse } from 'next/server';

let cache = { stocks: {}, crypto: {}, metals: {}, ts: 0, sources: {} };
const CACHE_TTL = 60000;

async function fetchYahooPrice(ticker) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=2d`;
    const r = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
    });
    if (!r.ok) return null;
    const data = await r.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (meta && typeof meta.regularMarketPrice === 'number' && meta.regularMarketPrice > 0) {
      const prev = meta.chartPreviousClose || meta.previousClose || meta.regularMarketPrice;
      const changePct = prev > 0 ? ((meta.regularMarketPrice - prev) / prev) * 100 : 0;
      return { price: meta.regularMarketPrice, changePct };
    }
  } catch (e) {}
  return null;
}

export const dynamic = 'force-dynamic';

export async function GET() {
  const now = Date.now();
  if (cache.ts && now - cache.ts < CACHE_TTL && Object.keys(cache.stocks).length > 5) {
    return NextResponse.json(cache);
  }
  const results = { stocks: {}, crypto: {}, metals: {}, ts: now, sources: {} };

  // CRYPTO + METALS in ONE CoinGecko call
  try {
    const cryptoIds = Object.values(CRYPTO_IDS).join(',');
    const allIds = cryptoIds + ',tether-gold';
    const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${allIds}&vs_currencies=eur&include_24hr_change=true`, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
    if (r.ok) {
      const data = await r.json();
      if (data?.bitcoin?.eur) {
        Object.entries(CRYPTO_IDS).forEach(([ticker, cgId]) => {
          const d = data[cgId];
          if (d && typeof d.eur === 'number') results.crypto[ticker] = { price: d.eur, changePct: d.eur_24h_change || 0 };
        });
        results.sources.crypto = 'coingecko';
      }
      if (data?.['tether-gold']?.eur) {
        const goldOz = data['tether-gold'].eur;
        const goldGram = goldOz / 31.1035;
        results.metals.gold = { pricePerGram: goldGram };
        results.metals.silver = { pricePerGram: goldGram / 85 };
        results.metals.platinum = { pricePerGram: goldGram * 0.35 };
        results.metals.palladium = { pricePerGram: goldGram * 0.33 };
        results.sources.metals = 'coingecko-xaut';
      }
    }
  } catch (e) { console.error('CoinGecko:', e.message); }

  // STOCKS - Yahoo Finance
  const allStocks = STOCKS_DB.filter(s => s.type === 'Action' || s.type === 'ETF');
  for (let i = 0; i < allStocks.length; i += 5) {
    const batch = allStocks.slice(i, i + 5);
    await Promise.all(batch.map(async (s) => {
      const result = await fetchYahooPrice(s.ticker);
      if (result) results.stocks[s.ticker] = result;
    }));
    if (i + 5 < allStocks.length) await new Promise(r => setTimeout(r, 300));
  }
  if (Object.keys(results.stocks).length > 0) {
    results.sources.stocks = 'yahoo';
  }

  cache = results;
  console.log('Bilan - Crypto:', results.sources.crypto || 'X', '| Actions:', results.sources.stocks || 'X', '(' + Object.keys(results.stocks).length + ')', '| Metaux:', results.sources.metals || 'X');
  return NextResponse.json(results);
}
