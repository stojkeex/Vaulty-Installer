export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
}

interface SearchResponse {
  coins: Array<{
    id: string;
    symbol: string;
    name: string;
  }>;
}

const SUPPORTED_VS_CURRENCIES = new Set(["usd", "eur", "gbp", "jpy", "aud", "cad"]);
const responseCache = new Map<string, { expiresAt: number; data: unknown }>();

const getVsCurrency = (currency: string = "usd") => {
  const normalized = currency.toLowerCase();
  return SUPPORTED_VS_CURRENCIES.has(normalized) ? normalized : "usd";
};

const fetchFromCoinGecko = async <T>(path: string, ttlMs: number = 30000): Promise<T> => {
  const cached = responseCache.get(path);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data as T;
  }

  const response = await fetch(`https://api.coingecko.com/api/v3${path}`, {
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`CoinGecko request failed: ${response.status}`);
  }

  const data = (await response.json()) as T;

  responseCache.set(path, {
    expiresAt: Date.now() + ttlMs,
    data,
  });

  return data;
};

export const getCoinsByIds = async (ids: string[], currency: string = "usd"): Promise<Coin[]> => {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean))).slice(0, 50);

  if (!uniqueIds.length) {
    return [];
  }

  try {
    const vsCurrency = getVsCurrency(currency);
    const data = await fetchFromCoinGecko<Coin[]>(
      `/coins/markets?vs_currency=${vsCurrency}&ids=${uniqueIds.join(",")}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`,
      25000,
    );

    const order = new Map(uniqueIds.map((id, index) => [id, index]));

    return [...data].sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999));
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getTopCoins = async (currency: string = "usd"): Promise<Coin[]> => {
  try {
    const vsCurrency = getVsCurrency(currency);
    return await fetchFromCoinGecko<Coin[]>(
      `/coins/markets?vs_currency=${vsCurrency}&order=market_cap_desc&per_page=25&page=1&sparkline=false&price_change_percentage=24h`,
      25000,
    );
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const searchCoins = async (query: string, currency: string = "usd"): Promise<Coin[]> => {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  try {
    const data = await fetchFromCoinGecko<SearchResponse>(
      `/search?query=${encodeURIComponent(trimmedQuery)}`,
      15000,
    );

    const ids = data.coins.slice(0, 12).map((coin) => coin.id);
    return await getCoinsByIds(ids, currency);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getCoinDetail = async (id: string, currency: string = "usd"): Promise<Coin | null> => {
  const [coin] = await getCoinsByIds([id], currency);
  return coin ?? null;
};

export const getMarketChart = async (
  id: string,
  days: number = 1,
  currency: string = "usd",
): Promise<{ x: number; y: number }[]> => {
  try {
    const vsCurrency = getVsCurrency(currency);
    const data = await fetchFromCoinGecko<{ prices: [number, number][] }>(
      `/coins/${id}/market_chart?vs_currency=${vsCurrency}&days=${days}`,
      25000,
    );

    return data.prices.map(([timestamp, price]) => ({
      x: timestamp,
      y: price,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};
