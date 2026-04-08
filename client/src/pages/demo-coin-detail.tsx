import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowLeft, TrendingUp, TrendingDown, Globe, Activity, Layers, Calendar, DollarSign, BarChart3, Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useDemoStore } from "@/hooks/use-demo-store";
import { getVaultyCoinChart, getVaultyCoinDetail, VAULTY_COIN_ID } from "@/lib/coingecko";
import { cn } from "@/lib/utils";
import { useCurrency, type CurrencyCode } from "@/contexts/currency-context";
import { VaultyIcon } from "@/components/ui/vaulty-icon";

const formatCompactNumber = (number: number) => {
  if (number === 0) return "0";
  if (!number) return "N/A";
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(number);
};

const getPriceFractionOptions = (amount: number) => {
  const absoluteAmount = Math.abs(amount);

  if (absoluteAmount > 0 && absoluteAmount < 0.01) {
    return { minimumFractionDigits: 6, maximumFractionDigits: 6 };
  }

  if (absoluteAmount > 0 && absoluteAmount < 1) {
    return { minimumFractionDigits: 4, maximumFractionDigits: 4 };
  }

  return { minimumFractionDigits: 2, maximumFractionDigits: 2 };
};

const stripHtml = (value?: string) => {
  if (!value) {
    return "No description available.";
  }

  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};

const TIMEFRAMES = [
  { label: "1H", value: "1h", days: "1" },
  { label: "24H", value: "24h", days: "1" },
  { label: "7D", value: "7d", days: "7" },
  { label: "1M", value: "30d", days: "30" },
  { label: "3M", value: "90d", days: "90" },
  { label: "1Y", value: "365d", days: "365" },
];

export default function DemoCoinDetail() {
  const [, params] = useRoute("/demo-trading/:id");
  const coinId = params?.id || "bitcoin";
  const { balance, holdings, transactions, buyCoin, sellCoin } = useDemoStore();
  const { currency, convert } = useCurrency();
  const { toast } = useToast();

  const [selectedTimeframe, setSelectedTimeframe] = useState(TIMEFRAMES[1]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [amount, setAmount] = useState("");
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");

  const isVaultyCredits = currency === "VC";
  const latestTradeStamp = transactions[0]?.date ?? "";

  const { data: coin, isLoading: loadingCoin, refetch: refetchCoin } = useQuery({
    queryKey: ["demoCoinDetail", coinId, currency],
    queryFn: async () => {
      if (coinId === VAULTY_COIN_ID) {
        return getVaultyCoinDetail();
      }

      const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
      if (!res.ok) throw new Error("Failed to fetch coin data");
      return res.json();
    },
    refetchInterval: coinId === VAULTY_COIN_ID ? 3000 : 15000,
    refetchOnWindowFocus: true,
  });

  const { data: chartData, isLoading: loadingChart, refetch: refetchChart } = useQuery({
    queryKey: ["demoCoinChart", coinId, selectedTimeframe.days, currency],
    queryFn: async () => {
      const vsCurrency = currency === "VC" ? "usd" : currency.toLowerCase();

      if (coinId === VAULTY_COIN_ID) {
        return getVaultyCoinChart(selectedTimeframe.days, vsCurrency);
      }

      const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${vsCurrency}&days=${selectedTimeframe.days}`);
      if (!res.ok) throw new Error("Failed to fetch chart data");
      const data = await res.json();

      return data.prices.map(([timestamp, price]: [number, number]) => ({
        date: timestamp,
        price,
      }));
    },
    refetchInterval: coinId === VAULTY_COIN_ID ? 3000 : 15000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (coinId !== VAULTY_COIN_ID) {
      return;
    }

    void refetchCoin();
    void refetchChart();
  }, [coinId, latestTradeStamp, holdings, refetchCoin, refetchChart]);

  useEffect(() => {
    if (coinId !== VAULTY_COIN_ID) {
      return;
    }

    const syncFromStorage = (event: StorageEvent) => {
      if (!event.key?.startsWith("vaulty_demo_store_")) {
        return;
      }

      void refetchCoin();
      void refetchChart();
    };

    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, [coinId, refetchCoin, refetchChart]);

  const holding = useMemo(() => holdings.find((item) => item.coinId === coinId), [holdings, coinId]);

  const formatSelectedAmount = (amountToFormat: number) => {
    const fractionDigits = getPriceFractionOptions(amountToFormat);

    if (isVaultyCredits) {
      return amountToFormat.toLocaleString(undefined, fractionDigits);
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      ...fractionDigits,
    }).format(amountToFormat);
  };

  const formatSelectedCompactAmount = (amountToFormat: number) => {
    if (amountToFormat === 0) {
      return isVaultyCredits ? "0" : new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(0);
    }

    if (Math.abs(amountToFormat) < 1000) {
      return formatSelectedAmount(amountToFormat);
    }

    if (isVaultyCredits) {
      return formatCompactNumber(amountToFormat);
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(amountToFormat);
  };

  const renderSelectedAmount = (amountToFormat: number, iconSize = 12) => {
    if (isVaultyCredits) {
      return (
        <>
          <VaultyIcon size={iconSize} />
          {formatSelectedAmount(amountToFormat)}
        </>
      );
    }

    return formatSelectedAmount(amountToFormat);
  };

  const renderSelectedCompactAmount = (amountToFormat: number, iconSize = 12) => {
    if (isVaultyCredits) {
      return (
        <>
          <VaultyIcon size={iconSize} />
          {formatSelectedCompactAmount(amountToFormat)}
        </>
      );
    }

    return formatSelectedCompactAmount(amountToFormat);
  };

  const formatHoldingAmount = (value: number) => {
    if (value === 0) {
      return "0";
    }

    if (Math.abs(value) >= 1000) {
      return formatCompactNumber(value);
    }

    if (Math.abs(value) >= 1) {
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    }

    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 4,
      maximumFractionDigits: 6,
    }).format(value);
  };

  if (loadingCoin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gray-500"></div>
      </div>
    );
  }

  if (!coin) {
    return <div className="min-h-screen bg-black text-white p-6">Coin not found</div>;
  }

  const priceChange = coin.market_data.price_change_percentage_24h ?? 0;
  const isPositive = priceChange >= 0;
  const currentPriceUsd = coin.market_data.current_price.usd;
  const currentPriceDisplay = currency === "VC" ? convert(currentPriceUsd, "USD", "VC") : coin.market_data.current_price[currency.toLowerCase()] ?? convert(currentPriceUsd);
  const marketCapDisplay = currency === "VC" ? convert(coin.market_data.market_cap.usd, "USD", "VC") : coin.market_data.market_cap[currency.toLowerCase()] ?? convert(coin.market_data.market_cap.usd);
  const totalVolumeDisplay = currency === "VC" ? convert(coin.market_data.total_volume.usd, "USD", "VC") : coin.market_data.total_volume[currency.toLowerCase()] ?? convert(coin.market_data.total_volume.usd);
  const high24hDisplay = currency === "VC" ? convert(coin.market_data.high_24h.usd, "USD", "VC") : coin.market_data.high_24h[currency.toLowerCase()] ?? convert(coin.market_data.high_24h.usd);
  const low24hDisplay = currency === "VC" ? convert(coin.market_data.low_24h.usd, "USD", "VC") : coin.market_data.low_24h[currency.toLowerCase()] ?? convert(coin.market_data.low_24h.usd);
  const descriptionText = stripHtml(coin.description?.en);

  const holdingAmount = holding?.amount ?? 0;
  const averageBuyPriceUsd = holding?.averageBuyPrice ?? 0;
  const holdingValueDisplay = convert(holdingAmount * currentPriceUsd, "USD", currency);
  const costBasisDisplay = convert(holdingAmount * averageBuyPriceUsd, "USD", currency);
  const profitDisplay = convert(holdingAmount * (currentPriceUsd - averageBuyPriceUsd), "USD", currency);
  const profitPercent = holding && averageBuyPriceUsd > 0
    ? ((currentPriceUsd - averageBuyPriceUsd) / averageBuyPriceUsd) * 100
    : 0;

  const availableTradeValueDisplay = tradeType === "buy"
    ? convert(balance, "USD", currency)
    : convert(holdingAmount * currentPriceUsd, "USD", currency);

  const tradeValueUsd = amount ? convert(Number(amount) || 0, currency as CurrencyCode, "USD") : 0;
  const estimatedCoinAmount = tradeValueUsd > 0 ? tradeValueUsd / currentPriceUsd : 0;

  const handleTrade = () => {
    if (!amount) return;

    try {
      const displayAmount = Number(amount);

      if (!Number.isFinite(displayAmount) || displayAmount <= 0) {
        throw new Error("Enter a valid amount");
      }

      const usdTradeValue = convert(displayAmount, currency as CurrencyCode, "USD");
      const coinsToTrade = usdTradeValue / currentPriceUsd;

      if (!Number.isFinite(coinsToTrade) || coinsToTrade <= 0) {
        throw new Error("Unable to calculate trade size");
      }

      if (tradeType === "buy") {
        buyCoin(coin.id, coin.symbol, coinsToTrade, currentPriceUsd);
        toast({
          title: "Buy order filled",
          description: `Bought ${formatHoldingAmount(coinsToTrade)} ${coin.symbol.toUpperCase()}`,
        });
      } else {
        sellCoin(coin.id, coin.symbol, coinsToTrade, currentPriceUsd);
        toast({
          title: "Sell order filled",
          description: `Sold ${formatHoldingAmount(coinsToTrade)} ${coin.symbol.toUpperCase()}`,
        });
      }

      if (coin.id === VAULTY_COIN_ID) {
        void refetchCoin();
        void refetchChart();
      }

      setAmount("");
    } catch (error: any) {
      toast({
        title: "Transaction failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const setMaxAmount = () => {
    setAmount(availableTradeValueDisplay.toFixed(2));
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md p-4 flex items-center gap-4 border-b border-white/10">
        <Link href="/demo-trading">
          <button
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            data-testid="button-back-demo-coin-detail"
          >
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div className="flex items-center gap-3 min-w-0">
          <img src={coin.image.small} alt={coin.name} className="w-8 h-8 rounded-full" />
          <div className="min-w-0">
            <h1 className="font-bold text-lg leading-none truncate">{coin.name}</h1>
            <span className="text-xs text-gray-400 uppercase">{coin.symbol}</span>
          </div>
        </div>
        <div className="ml-auto flex flex-col items-end">
          <span className="font-bold text-lg" data-testid="text-demo-current-price">{formatSelectedAmount(currentPriceDisplay)}</span>
          <span className={cn("text-xs flex items-center", isPositive ? "text-gray-400" : "text-slate-500")} data-testid="text-demo-price-change">
            {isPositive ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
            {priceChange.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-md mx-auto">
        <div className="space-y-4">
          <div className="h-[250px] w-full -mx-2 relative group">
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute top-2 right-2 z-10 p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
              data-testid="button-demo-chart-fullscreen"
            >
              <Maximize2 size={16} />
            </button>
            {loadingChart ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">Loading Chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="demoColorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isPositive ? "#06b6d4" : "#ec4899"} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={isPositive ? "#06b6d4" : "#ec4899"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide type="number" domain={["dataMin", "dataMax"]} />
                  <YAxis hide domain={["auto", "auto"]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px" }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    formatter={(value: number) => [formatSelectedAmount(value), "Price"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={isPositive ? "#06b6d4" : "#ec4899"}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#demoColorPrice)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex justify-between bg-white/5 p-1 rounded-xl">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.label}
                onClick={() => setSelectedTimeframe(tf)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  selectedTimeframe.value === tf.value
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-300"
                )}
                data-testid={`button-demo-timeframe-${tf.label.toLowerCase()}`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <Activity size={14} /> Market Cap
            </div>
            <div className="font-bold text-lg" data-testid="text-demo-market-cap">{renderSelectedCompactAmount(marketCapDisplay, 12)}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <BarChart3 size={14} /> Volume (24h)
            </div>
            <div className="font-bold text-lg" data-testid="text-demo-volume-24h">{renderSelectedCompactAmount(totalVolumeDisplay, 12)}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <TrendingUp size={14} /> 24h High
            </div>
            <div className="font-bold text-lg" data-testid="text-demo-high-24h">{formatSelectedAmount(high24hDisplay)}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <TrendingDown size={14} /> 24h Low
            </div>
            <div className="font-bold text-lg" data-testid="text-demo-low-24h">{formatSelectedAmount(low24hDisplay)}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Demo trading</p>
              <h2 className="text-lg font-bold">Buy or sell {coin.symbol.toUpperCase()}</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-300">
              Live
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
              <div className="text-gray-400 text-xs mb-1 uppercase tracking-wide">Holding</div>
              <div className="font-bold text-base" data-testid="text-demo-holding-amount">{formatHoldingAmount(holdingAmount)}</div>
            </div>
            <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
              <div className="text-gray-400 text-xs mb-1 uppercase tracking-wide">Value</div>
              <div className="font-bold text-base flex items-center gap-1" data-testid="text-demo-holding-value">{renderSelectedCompactAmount(holdingValueDisplay, 11)}</div>
            </div>
            <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
              <div className="text-gray-400 text-xs mb-1 uppercase tracking-wide">P/L</div>
              <div className={cn("font-bold text-base flex items-center gap-1", profitDisplay >= 0 ? "text-white" : "text-zinc-400")} data-testid="text-demo-holding-profit">
                {profitDisplay >= 0 ? "+" : "-"}
                {renderSelectedCompactAmount(Math.abs(profitDisplay), 11)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTradeType("buy")}
              className={cn(
                "rounded-xl py-3 text-sm font-semibold transition-all border",
                tradeType === "buy"
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-black/20 border-white/5 text-gray-400 hover:text-white"
              )}
              data-testid="button-trade-type-buy"
            >
              Buy
            </button>
            <button
              onClick={() => setTradeType("sell")}
              className={cn(
                "rounded-xl py-3 text-sm font-semibold transition-all border",
                tradeType === "sell"
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-black/20 border-white/5 text-gray-400 hover:text-white"
              )}
              data-testid="button-trade-type-sell"
            >
              Sell
            </button>
          </div>

          <div className="space-y-3">
            <label className="text-xs text-gray-400 block">Amount in {isVaultyCredits ? "Vaulty Credits" : currency}</label>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
              <input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                className="w-full bg-transparent text-3xl font-bold text-white placeholder:text-zinc-600 focus:outline-none"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                data-testid="input-demo-trade-amount"
              />
              <button
                onClick={setMaxAmount}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
                data-testid="button-demo-trade-max"
              >
                MAX
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
              <div className="text-gray-400 text-xs mb-1 uppercase tracking-wide">Available</div>
              <div className="font-bold text-sm flex items-center gap-1" data-testid="text-demo-available-trade-value">
                {renderSelectedCompactAmount(availableTradeValueDisplay, 10)}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
              <div className="text-gray-400 text-xs mb-1 uppercase tracking-wide">Estimated</div>
              <div className="font-bold text-sm" data-testid="text-demo-estimated-coin-amount">{formatHoldingAmount(estimatedCoinAmount)} {coin.symbol.toUpperCase()}</div>
            </div>
            <div className="col-span-2 p-4 rounded-2xl bg-black/20 border border-white/5 flex items-center justify-between gap-3">
              <div>
                <div className="text-gray-400 text-xs mb-1 uppercase tracking-wide">Cost basis</div>
                <div className="font-bold text-sm">{renderSelectedCompactAmount(costBasisDisplay, 10)}</div>
              </div>
              <div className="text-right">
                <div className="text-gray-400 text-xs mb-1 uppercase tracking-wide">Return</div>
                <div className={cn("font-bold text-sm", profitPercent >= 0 ? "text-white" : "text-zinc-400")}>
                  {profitPercent >= 0 ? "+" : "-"}{Math.abs(profitPercent).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          <Button
            className="w-full rounded-xl bg-white text-black hover:bg-zinc-200 font-semibold"
            onClick={handleTrade}
            data-testid="button-submit-demo-trade"
          >
            {tradeType === "buy" ? `Buy ${coin.symbol.toUpperCase()}` : `Sell ${coin.symbol.toUpperCase()}`}
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-lg">About {coin.name}</h3>

          <div className="space-y-3">
            <div className="rounded-xl bg-white/5 border border-white/5 p-4">
              <p className="text-gray-300 text-sm leading-6" data-testid="text-demo-coin-description">{descriptionText}</p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-gray-400 text-sm flex items-center gap-2">
                <Layers size={16} /> Rank
              </span>
              <span className="font-bold">#{coin.market_cap_rank}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-gray-400 text-sm flex items-center gap-2">
                <Calendar size={16} /> Created
              </span>
              <span className="font-bold">
                {coin.genesis_date ? new Date(coin.genesis_date).toLocaleDateString() : "N/A"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-gray-400 text-sm flex items-center gap-2">
                <Globe size={16} /> Website
              </span>
              <a
                href={coin.links.homepage[0]}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 text-sm hover:underline truncate max-w-[150px]"
                data-testid="link-demo-coin-website"
              >
                {coin.links.homepage[0]?.replace("https://", "") || "N/A"}
              </a>
            </div>
          </div>

          <div className="p-4 rounded-2xl mt-4 bg-white/5 border border-white/10">
            <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
              <DollarSign size={16} className="text-gray-400" /> Supported Chains
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.keys(coin.platforms).length > 0 ? (
                Object.keys(coin.platforms).slice(0, 5).map((chain) => (
                  chain ? (
                    <span key={chain} className="px-2 py-1 rounded-md bg-white/10 text-xs text-gray-300 capitalize">
                      {chain}
                    </span>
                  ) : null
                ))
              ) : (
                <span className="text-xs text-gray-500">Native Chain ({coin.name})</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col p-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold">{coin.name}</h2>
              <span className="text-sm text-gray-400 uppercase">{coin.symbol}</span>
            </div>
            <button onClick={() => setIsFullscreen(false)} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20" data-testid="button-close-demo-chart-fullscreen">
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 bg-zinc-900/50 rounded-2xl border border-white/5 p-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="demoColorPriceFullscreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive ? "#06b6d4" : "#ec4899"} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={isPositive ? "#06b6d4" : "#ec4899"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  stroke="#555"
                />
                <YAxis
                  domain={["auto", "auto"]}
                  stroke="#555"
                  tickFormatter={(val) => formatSelectedAmount(val)}
                  width={60}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px" }}
                  labelFormatter={(label) => new Date(label).toLocaleString()}
                  formatter={(value: number) => [formatSelectedAmount(value), "Price"]}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isPositive ? "#06b6d4" : "#ec4899"}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#demoColorPriceFullscreen)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
