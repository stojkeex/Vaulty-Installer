import vaultyLogo from "@assets/1934AF6F-6D3D-49A5-A43E-F71984228AEC_1776900057983.png";

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

interface DemoTransactionLike {
  coinId?: string;
  amount?: number;
  priceAtTransaction?: number;
  totalValue?: number;
  date?: string;
  type?: "buy" | "sell";
}

interface DemoStoreLike {
  transactions?: DemoTransactionLike[];
}

interface VaultyTrade {
  timestamp: number;
  amount: number;
  usdValue: number;
  direction: 1 | -1;
}

interface VaultySeriesPoint {
  date: number;
  priceUsd: number;
  circulatingSupply: number;
  volume24hUsd: number;
  marketCapUsd: number;
}

const SUPPORTED_VS_CURRENCIES = new Set(["usd", "eur", "gbp", "jpy", "aud", "cad"]);
const responseCache = new Map<string, { expiresAt: number; data: unknown }>();

export const VAULTY_COIN_ID = "vaulty-coin";

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const VAULTY_COIN_BASE_PRICE_USD = 0.001;
const PRICE_MULTIPLIERS: Record<string, number> = {
  usd: 1,
  eur: 0.92,
  gbp: 0.78,
  jpy: 150.25,
  aud: 1.52,
  cad: 1.35,
};

const getVsCurrency = (currency: string = "usd") => {
  const normalized = currency.toLowerCase();
  return SUPPORTED_VS_CURRENCIES.has(normalized) ? normalized : "usd";
};

const toCurrencyAmount = (amountUsd: number, currency: string = "usd") => {
  return amountUsd * (PRICE_MULTIPLIERS[getVsCurrency(currency)] ?? 1);
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

const getLocalDemoStores = (): DemoStoreLike[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const latestStores = new Map<string, { version: number; store: DemoStoreLike }>();

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);

    if (!key || !key.startsWith("vaulty_demo_store_")) {
      continue;
    }

    const rawValue = window.localStorage.getItem(key);

    if (!rawValue) {
      continue;
    }

    try {
      const parsed = JSON.parse(rawValue) as DemoStoreLike;
      const match = key.match(/^vaulty_demo_store_(.*?)(?:_v(\d+))?$/);
      const userKey = match?.[1] || key;
      const version = Number(match?.[2] || 1);
      const existing = latestStores.get(userKey);

      if (!existing || version >= existing.version) {
        latestStores.set(userKey, { version, store: parsed });
      }
    } catch (error) {
      console.error("Failed to parse local demo trading store", error);
    }
  }

  return Array.from(latestStores.values()).map((entry) => entry.store);
};

const getVaultyTrades = (): VaultyTrade[] => {
  return getLocalDemoStores()
    .flatMap((store) => store.transactions ?? [])
    .filter((transaction): transaction is DemoTransactionLike & { coinId: string; type: "buy" | "sell" } => {
      return transaction.coinId === VAULTY_COIN_ID && (transaction.type === "buy" || transaction.type === "sell");
    })
    .map((transaction) => {
      const amount = Number(transaction.amount) || 0;
      const priceAtTransaction = Number(transaction.priceAtTransaction) || VAULTY_COIN_BASE_PRICE_USD;
      const usdValue = Number(transaction.totalValue) || amount * priceAtTransaction;
      const timestamp = transaction.date ? new Date(transaction.date).getTime() : Date.now();

      return {
        timestamp: Number.isFinite(timestamp) ? timestamp : Date.now(),
        amount: Math.max(0, amount),
        usdValue: Math.max(0, usdValue),
        direction: (transaction.type === "buy" ? 1 : -1) as 1 | -1,
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);
};

const buildVaultySeries = (days: number | string = 2) => {
  const numericDays = Math.max(1, Number(days) || 1);
  const pointCount = numericDays <= 1 ? 48 : numericDays <= 7 ? 84 : 120;
  const end = Date.now();
  const start = end - numericDays * DAY_MS;
  const trades = getVaultyTrades();
  const activeTrades = trades.filter((trade) => trade.timestamp <= end);
  let tradeIndex = 0;
  const rollingTrades: VaultyTrade[] = [];
  let circulatingSupply = 0;

  return Array.from({ length: pointCount }, (_, index) => {
    const progress = index / Math.max(1, pointCount - 1);
    const timestamp = start + progress * (end - start);

    while (tradeIndex < activeTrades.length && activeTrades[tradeIndex].timestamp <= timestamp) {
      const trade = activeTrades[tradeIndex];
      circulatingSupply = Math.max(0, circulatingSupply + trade.direction * trade.amount);
      rollingTrades.push(trade);
      tradeIndex += 1;
    }

    while (rollingTrades.length > 0 && rollingTrades[0].timestamp < timestamp - DAY_MS) {
      rollingTrades.shift();
    }

    const macroWave = Math.sin(progress * Math.PI * 2.1 + numericDays * 0.37) * 0.032;
    const microWave = Math.cos(progress * Math.PI * 7.3 + 0.6) * 0.015;
    const jitter = Math.sin(progress * Math.PI * 18.7 + 1.1) * 0.006;
    const demandPremium = Math.min(1.6, (circulatingSupply / 1_000_000) * 0.045);
    const recentShock = rollingTrades.reduce((total, trade) => {
      const ageHours = Math.max(0, (timestamp - trade.timestamp) / HOUR_MS);
      const volumeImpact = Math.min(0.18, Math.sqrt(Math.max(0, trade.usdValue) / 1000) * 0.012 + (trade.amount / 1_000_000) * 0.02);
      return total + trade.direction * volumeImpact * Math.exp(-ageHours / 18);
    }, 0);
    const priceUsd = Math.max(
      0.00005,
      VAULTY_COIN_BASE_PRICE_USD * (1 + macroWave + microWave + jitter + demandPremium + recentShock),
    );
    const volume24hUsd = rollingTrades.reduce((total, trade) => total + trade.usdValue, 0);

    return {
      date: timestamp,
      priceUsd,
      circulatingSupply,
      volume24hUsd,
      marketCapUsd: circulatingSupply * priceUsd,
    } satisfies VaultySeriesPoint;
  });
};

const getVaultyMarketSnapshot = () => {
  const series = buildVaultySeries(2);
  const latestPoint = series[series.length - 1] ?? {
    date: Date.now(),
    priceUsd: VAULTY_COIN_BASE_PRICE_USD,
    circulatingSupply: 0,
    volume24hUsd: 0,
    marketCapUsd: 0,
  };
  const dayAgoTimestamp = latestPoint.date - DAY_MS;
  const dayAgoPoint = [...series].reverse().find((point) => point.date <= dayAgoTimestamp) ?? series[0] ?? latestPoint;
  const recentWindow = series.filter((point) => point.date >= dayAgoTimestamp);
  const high24hUsd = recentWindow.reduce((highest, point) => Math.max(highest, point.priceUsd), latestPoint.priceUsd);
  const low24hUsd = recentWindow.reduce((lowest, point) => Math.min(lowest, point.priceUsd), latestPoint.priceUsd);
  const priceChangePercentage24h = dayAgoPoint.priceUsd > 0
    ? ((latestPoint.priceUsd - dayAgoPoint.priceUsd) / dayAgoPoint.priceUsd) * 100
    : 0;

  return {
    currentPriceUsd: latestPoint.priceUsd,
    marketCapUsd: latestPoint.marketCapUsd,
    volume24hUsd: latestPoint.volume24hUsd,
    high24hUsd,
    low24hUsd,
    priceChangePercentage24h,
    circulatingSupply: latestPoint.circulatingSupply,
  };
};

const createVaultyCoinMarket = (currency: string = "usd"): Coin => {
  const snapshot = getVaultyMarketSnapshot();

  return {
    id: VAULTY_COIN_ID,
    symbol: "vlty",
    name: "Vaulty Coin",
    image: vaultyLogo,
    current_price: toCurrencyAmount(snapshot.currentPriceUsd, currency),
    market_cap: toCurrencyAmount(snapshot.marketCapUsd, currency),
    market_cap_rank: snapshot.marketCapUsd > 0 ? 1 : 0,
    price_change_percentage_24h: snapshot.priceChangePercentage24h,
    high_24h: toCurrencyAmount(snapshot.high24hUsd, currency),
    low_24h: toCurrencyAmount(snapshot.low24hUsd, currency),
  };
};

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

export const getVaultyCoinDetail = () => {
  const snapshot = getVaultyMarketSnapshot();

  return {
    id: VAULTY_COIN_ID,
    symbol: "vlty",
    name: "Vaulty Coin",
    image: {
      thumb: vaultyLogo,
      small: vaultyLogo,
      large: vaultyLogo,
    },
    market_cap_rank: snapshot.marketCapUsd > 0 ? 1 : 0,
    genesis_date: "2026-04-08",
    links: {
      homepage: ["https://vaulty.app"],
    },
    platforms: {
      vaulty: "native",
    },
    description: {
      en: "Vaulty Coin is the native asset in Vaulty Demo Trading. Its price reacts to buy and sell pressure from demo trades, while market cap only grows when coins are actually accumulated.",
    },
    market_data: {
      current_price: {
        usd: snapshot.currentPriceUsd,
        eur: toCurrencyAmount(snapshot.currentPriceUsd, "eur"),
        gbp: toCurrencyAmount(snapshot.currentPriceUsd, "gbp"),
        jpy: toCurrencyAmount(snapshot.currentPriceUsd, "jpy"),
        aud: toCurrencyAmount(snapshot.currentPriceUsd, "aud"),
        cad: toCurrencyAmount(snapshot.currentPriceUsd, "cad"),
      },
      market_cap: {
        usd: snapshot.marketCapUsd,
        eur: toCurrencyAmount(snapshot.marketCapUsd, "eur"),
        gbp: toCurrencyAmount(snapshot.marketCapUsd, "gbp"),
        jpy: toCurrencyAmount(snapshot.marketCapUsd, "jpy"),
        aud: toCurrencyAmount(snapshot.marketCapUsd, "aud"),
        cad: toCurrencyAmount(snapshot.marketCapUsd, "cad"),
      },
      total_volume: {
        usd: snapshot.volume24hUsd,
        eur: toCurrencyAmount(snapshot.volume24hUsd, "eur"),
        gbp: toCurrencyAmount(snapshot.volume24hUsd, "gbp"),
        jpy: toCurrencyAmount(snapshot.volume24hUsd, "jpy"),
        aud: toCurrencyAmount(snapshot.volume24hUsd, "aud"),
        cad: toCurrencyAmount(snapshot.volume24hUsd, "cad"),
      },
      high_24h: {
        usd: snapshot.high24hUsd,
        eur: toCurrencyAmount(snapshot.high24hUsd, "eur"),
        gbp: toCurrencyAmount(snapshot.high24hUsd, "gbp"),
        jpy: toCurrencyAmount(snapshot.high24hUsd, "jpy"),
        aud: toCurrencyAmount(snapshot.high24hUsd, "aud"),
        cad: toCurrencyAmount(snapshot.high24hUsd, "cad"),
      },
      low_24h: {
        usd: snapshot.low24hUsd,
        eur: toCurrencyAmount(snapshot.low24hUsd, "eur"),
        gbp: toCurrencyAmount(snapshot.low24hUsd, "gbp"),
        jpy: toCurrencyAmount(snapshot.low24hUsd, "jpy"),
        aud: toCurrencyAmount(snapshot.low24hUsd, "aud"),
        cad: toCurrencyAmount(snapshot.low24hUsd, "cad"),
      },
      price_change_percentage_24h: snapshot.priceChangePercentage24h,
      circulating_supply: snapshot.circulatingSupply,
    },
  };
};

export const getVaultyCoinChart = (days: number | string, currency: string = "usd") => {
  const vsCurrency = getVsCurrency(currency);

  return buildVaultySeries(days).map((point) => ({
    date: point.date,
    price: toCurrencyAmount(point.priceUsd, vsCurrency),
  }));
};
