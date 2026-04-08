import vaultyLogo from "@assets/IMG_1067_1775569221193.png";

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

export const VAULTY_COIN_ID = "vaulty-coin";

const PRICE_MULTIPLIERS: Record<string, number> = {
  usd: 1,
  eur: 0.92,
  gbp: 0.78,
  jpy: 150.25,
  aud: 1.52,
  cad: 1.35,
};

const VAULTY_COIN_BASE_PRICE_USD = 0.001;
const VAULTY_COIN_24H_CHANGE = 8.42;

const getVsCurrency = (currency: string = "usd") => {
  const normalized = currency.toLowerCase();
  return SUPPORTED_VS_CURRENCIES.has(normalized) ? normalized : "usd";
};

const toCurrencyAmount = (amountUsd: number, currency: string = "usd") => {
  const vsCurrency = getVsCurrency(currency);
  return amountUsd * (PRICE_MULTIPLIERS[vsCurrency] ?? 1);
};

const createVaultyCoinMarket = (currency: string = "usd"): Coin => {
  const currentPrice = toCurrencyAmount(VAULTY_COIN_BASE_PRICE_USD, currency);
  const lowPrice = toCurrencyAmount(0.00092, currency);
  const highPrice = toCurrencyAmount(0.00108, currency);

  return {
    id: VAULTY_COIN_ID,
    symbol: "vlty",
    name: "Vaulty Coin",
    image: vaultyLogo,
    current_price: currentPrice,
    market_cap: toCurrencyAmount(1250000, currency),
    market_cap_rank: 1,
    price_change_percentage_24h: VAULTY_COIN_24H_CHANGE,
    high_24h: highPrice,
    low_24h: lowPrice,
  };
};

const mergeUniqueCoins = (coins: Coin[]) => {
  return coins.filter((coin, index, array) => array.findIndex((item) => item.id === coin.id) === index);
};

const isVaultyQueryMatch = (query: string) => {
  const normalized = query.trim().toLowerCase();
  return ["vaulty", "vaulty coin", "vlty"].some((term) => normalized.includes(term));
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

export const isVaultyCoin = (id: string) => id === VAULTY_COIN_ID;

export const getCoinsByIds = async (ids: string[], currency: string = "usd"): Promise<Coin[]> => {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean))).slice(0, 50);

  if (!uniqueIds.length) {
    return [];
  }

  const remoteIds = uniqueIds.filter((id) => !isVaultyCoin(id));
  const vaultyCoin = uniqueIds.includes(VAULTY_COIN_ID) ? createVaultyCoinMarket(currency) : null;

  try {
    const remoteCoins = remoteIds.length
      ? await fetchFromCoinGecko<Coin[]>(
          `/coins/markets?vs_currency=${getVsCurrency(currency)}&ids=${remoteIds.join(",")}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`,
          25000,
        )
      : [];

    const coinMap = new Map(remoteCoins.map((coin) => [coin.id, coin]));

    if (vaultyCoin) {
      coinMap.set(vaultyCoin.id, vaultyCoin);
    }

    return uniqueIds.map((id) => coinMap.get(id)).filter((coin): coin is Coin => Boolean(coin));
  } catch (error) {
    console.error(error);
    return vaultyCoin ? [vaultyCoin] : [];
  }
};

export const getTopCoins = async (currency: string = "usd"): Promise<Coin[]> => {
  try {
    const vsCurrency = getVsCurrency(currency);
    const marketCoins = await fetchFromCoinGecko<Coin[]>(
      `/coins/markets?vs_currency=${vsCurrency}&order=market_cap_desc&per_page=25&page=1&sparkline=false&price_change_percentage=24h`,
      25000,
    );

    return mergeUniqueCoins([createVaultyCoinMarket(currency), ...marketCoins]);
  } catch (error) {
    console.error(error);
    return [createVaultyCoinMarket(currency)];
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
    const matchedCoins = await getCoinsByIds(ids, currency);

    if (isVaultyQueryMatch(trimmedQuery)) {
      return mergeUniqueCoins([createVaultyCoinMarket(currency), ...matchedCoins]);
    }

    return matchedCoins;
  } catch (error) {
    console.error(error);
    return isVaultyQueryMatch(trimmedQuery) ? [createVaultyCoinMarket(currency)] : [];
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

export const getVaultyCoinDetail = () => ({
  id: VAULTY_COIN_ID,
  symbol: "vlty",
  name: "Vaulty Coin",
  image: {
    thumb: vaultyLogo,
    small: vaultyLogo,
    large: vaultyLogo,
  },
  market_cap_rank: 1,
  genesis_date: "2026-04-08",
  links: {
    homepage: ["https://vaulty.app"],
  },
  platforms: {
    vaulty: "native",
  },
  description: {
    en: "Vaulty Coin is the native demo asset inside Vaulty trading. It launches at $0.001 and is designed for practicing entries, exits, and portfolio growth inside the Vaulty ecosystem.",
  },
  market_data: {
    current_price: {
      usd: 0.001,
      eur: 0.00092,
      gbp: 0.00078,
      jpy: 0.15025,
      aud: 0.00152,
      cad: 0.00135,
    },
    market_cap: {
      usd: 1250000,
      eur: 1150000,
      gbp: 975000,
      jpy: 187812500,
      aud: 1900000,
      cad: 1687500,
    },
    total_volume: {
      usd: 185000,
      eur: 170200,
      gbp: 144300,
      jpy: 27800000,
      aud: 281200,
      cad: 249750,
    },
    high_24h: {
      usd: 0.00108,
      eur: 0.000994,
      gbp: 0.000842,
      jpy: 0.16227,
      aud: 0.001642,
      cad: 0.001458,
    },
    low_24h: {
      usd: 0.00092,
      eur: 0.000846,
      gbp: 0.000718,
      jpy: 0.13823,
      aud: 0.001398,
      cad: 0.001242,
    },
    price_change_percentage_24h: VAULTY_COIN_24H_CHANGE,
  },
});

export const getVaultyCoinChart = (days: number | string, currency: string = "usd") => {
  const numericDays = Math.max(1, Number(days) || 1);
  const pointCount = numericDays <= 1 ? 48 : numericDays <= 7 ? 56 : 72;
  const end = Date.now();
  const start = end - numericDays * 24 * 60 * 60 * 1000;
  const multiplier = PRICE_MULTIPLIERS[getVsCurrency(currency)] ?? 1;

  return Array.from({ length: pointCount }, (_, index) => {
    const progress = index / Math.max(1, pointCount - 1);
    const timestamp = start + progress * (end - start);
    const intradayWave = Math.sin(progress * Math.PI * 2.2) * 0.000035;
    const secondaryWave = Math.cos(progress * Math.PI * 6) * 0.000012;
    const trend = progress * 0.00011 * Math.min(1.15, numericDays / 30 + 0.35);
    const priceUsd = Math.max(0.00082, VAULTY_COIN_BASE_PRICE_USD + intradayWave + secondaryWave + trend);

    return {
      date: timestamp,
      price: priceUsd * multiplier,
    };
  });
};
