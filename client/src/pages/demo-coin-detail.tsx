import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowLeft, TrendingUp, TrendingDown, Activity, Layers, Calendar, DollarSign, BarChart3, Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useDemoStore } from "@/hooks/use-demo-store";
import { getVaultyCoinChart, getVaultyCoinDetail, VAULTY_COIN_ID } from "@/lib/coingecko";
import { cn } from "@/lib/utils";
import { useCurrency, type CurrencyCode } from "@/contexts/currency-context";
import { format as formatDate } from "date-fns";
import { VaultyIcon } from "@/components/ui/vaulty-icon";

const formatCompactNumber = (number: number, maximumFractionDigits = 2) => {
  if (number === 0) return "0";
  if (!number) return "N/A";

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits,
  }).format(number);
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

  const holding = useMemo(
    () => holdings.find((item) => item.coinId === coinId),
    [holdings, coinId],
  );

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
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-white/50"></div>
      </div>
    );
  }

  if (!coin) {
    return <div className="min-h-screen bg-black p-6 text-white">Coin not found</div>;
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
  const averageBuyPriceDisplay = convert(averageBuyPriceUsd, "USD", currency);
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

  const glassPanel = "border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[0_22px_60px_rgba(0,0,0,0.38)] backdrop-blur-2xl";
  const statCard = "rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl";
  const neutralTint = isPositive ? "text-white" : "text-zinc-300";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_30%),linear-gradient(180deg,#060606_0%,#000_52%,#050505_100%)] pb-10 text-white">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-black/65 px-4 py-4 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-md items-center gap-4">
          <Link href="/demo-trading">
            <button
              className="rounded-full border border-white/10 bg-white/5 p-2.5 text-white transition-all hover:bg-white/10"
              data-testid="button-back-demo-coin-detail"
            >
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div className="min-w-0 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/10 shadow-[0_10px_24px_rgba(0,0,0,0.3)]">
              <img src={coin.image.small} alt={coin.name} className="h-8 w-8 rounded-full" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-black leading-none">{coin.name}</h1>
              <span className="text-[11px] uppercase tracking-[0.22em] text-zinc-400">{coin.symbol}</span>
            </div>
          </div>
          <div className="ml-auto flex flex-col items-end">
            <span className="text-lg font-black">{formatSelectedAmount(currentPriceDisplay)}</span>
            <span className={cn("flex items-center text-xs", neutralTint)} data-testid="text-demo-coin-price-change">
              {isPositive ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
              {Math.abs(priceChange).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-md flex-col gap-5 px-4 py-5">
        <div className="grid grid-cols-3 gap-3">
          <div className={statCard}>
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Holding</div>
            <div className="mt-2 text-base font-black leading-tight" data-testid="text-demo-holding-amount">{formatHoldingAmount(holdingAmount)}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-zinc-600">{coin.symbol}</div>
          </div>
          <div className={statCard}>
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Value</div>
            <div className="mt-2 flex items-center gap-1 text-base font-black leading-tight" data-testid="text-demo-holding-value">
              {renderSelectedCompactAmount(holdingValueDisplay, 12)}
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-zinc-600">Live</div>
          </div>
          <div className={statCard}>
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">P/L</div>
            <div className={cn("mt-2 flex items-center gap-1 text-base font-black leading-tight", profitDisplay >= 0 ? "text-white" : "text-zinc-400")} data-testid="text-demo-holding-profit">
              {profitDisplay >= 0 ? "+" : "-"}
              {renderSelectedCompactAmount(Math.abs(profitDisplay), 12)}
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-zinc-600">{profitPercent >= 0 ? "Profit" : "Loss"}</div>
          </div>
        </div>

        <div className={cn("space-y-4 rounded-[32px] p-5", glassPanel)}>
          <div className="mb-1 flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Market pulse</div>
              <div className="mt-1 text-2xl font-black tracking-tight">{formatSelectedAmount(currentPriceDisplay)}</div>
            </div>
            <button
              onClick={() => setIsFullscreen(true)}
              className="rounded-xl border border-white/10 bg-white/6 p-2 text-white transition-all hover:bg-white/10"
              data-testid="button-demo-chart-fullscreen"
            >
              <Maximize2 size={16} />
            </button>
          </div>

          <div className="relative -mx-2 h-[250px] w-full overflow-hidden rounded-[28px] border border-white/6 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] px-2 py-3">
            {loadingChart ? (
              <div className="flex h-full items-center justify-center text-sm text-zinc-500">Loading chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="demoTradeChartColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide type="number" domain={["dataMin", "dataMax"]} />
                  <YAxis hide domain={["auto", "auto"]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "16px", color: "#fff" }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    formatter={(value: number) => [formatSelectedAmount(value), "Price"]}
                  />
                  <Area type="monotone" dataKey="price" stroke="#06b6d4" strokeWidth={2.25} fillOpacity={1} fill="url(#demoTradeChartColor)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-6 gap-1 rounded-[18px] border border-white/8 bg-black/35 p-1">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.label}
                onClick={() => setSelectedTimeframe(tf)}
                className={cn(
                  "rounded-[14px] px-2 py-2 text-[11px] font-bold tracking-wide transition-all",
                  selectedTimeframe.value === tf.value
                    ? "bg-white text-black shadow-[0_10px_24px_rgba(255,255,255,0.18)]"
                    : "text-zinc-500 hover:text-white"
                )}
                data-testid={`button-demo-timeframe-${tf.label.toLowerCase()}`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        <div className={cn("rounded-[32px] p-5", glassPanel)}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Demo trading</p>
              <h2 className="text-xl font-black tracking-tight">Buy or sell {coin.symbol.toUpperCase()}</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-200">
              Live paper trades
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 rounded-[22px] border border-white/8 bg-black/40 p-1.5">
            <button
              onClick={() => setTradeType("buy")}
              className={cn(
                "rounded-[18px] py-3 text-sm font-black transition-all",
                tradeType === "buy"
                  ? "bg-white text-black shadow-[0_14px_34px_rgba(255,255,255,0.18)]"
                  : "text-zinc-400 hover:text-white"
              )}
              data-testid="button-trade-type-buy"
            >
              Buy
            </button>
            <button
              onClick={() => setTradeType("sell")}
              className={cn(
                "rounded-[18px] py-3 text-sm font-black transition-all",
                tradeType === "sell"
                  ? "bg-white text-black shadow-[0_14px_34px_rgba(255,255,255,0.18)]"
                  : "text-zinc-400 hover:text-white"
              )}
              data-testid="button-trade-type-sell"
            >
              Sell
            </button>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-[24px] border border-white/8 bg-black/30 p-4 backdrop-blur-xl">
              <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Avg entry</div>
              <div className="mt-2 font-black text-white">{formatSelectedAmount(averageBuyPriceDisplay)}</div>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-black/30 p-4 backdrop-blur-xl">
              <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Return</div>
              <div className={cn("mt-2 font-black", profitPercent >= 0 ? "text-white" : "text-zinc-400")}>{profitPercent >= 0 ? "+" : "-"}{Math.abs(profitPercent).toFixed(2)}%</div>
            </div>
            <div className="col-span-2 rounded-[24px] border border-white/8 bg-black/30 p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                <span>Cost basis</span>
                <span className="text-zinc-300">Live holding</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-sm font-black">
                <span>{renderSelectedCompactAmount(costBasisDisplay, 11)}</span>
                <span>{renderSelectedCompactAmount(holdingValueDisplay, 11)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="ml-1 text-xs text-zinc-400">Amount in {isVaultyCredits ? "Vaulty Credits" : currency}</label>
            <div className="flex items-center gap-3 rounded-[26px] border border-white/10 bg-black/40 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl">
              <input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                className="w-full bg-transparent text-3xl font-black text-white placeholder:text-zinc-600 focus:outline-none"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                data-testid="input-demo-trade-amount"
              />
              <button
                onClick={setMaxAmount}
                className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-black text-white transition-colors hover:bg-white/14"
                data-testid="button-demo-trade-max"
              >
                MAX
              </button>
            </div>

            <div className="space-y-2 rounded-[24px] border border-white/8 bg-black/25 p-4 text-xs backdrop-blur-xl">
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">Available</span>
                <span className="flex items-center gap-1 font-mono text-white" data-testid="text-demo-available-trade-value">
                  {renderSelectedCompactAmount(availableTradeValueDisplay, 10)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">Estimated</span>
                <span className="font-mono text-white" data-testid="text-demo-estimated-coin-amount">{formatHoldingAmount(estimatedCoinAmount)} {coin.symbol.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <Button
            className="mt-5 h-14 w-full rounded-[24px] border border-white/10 bg-white text-base font-black text-black shadow-[0_18px_40px_rgba(255,255,255,0.15)] transition-all hover:bg-zinc-100 hover:scale-[1.01] active:scale-[0.99]"
            onClick={handleTrade}
            data-testid="button-submit-demo-trade"
          >
            {tradeType === "buy" ? `Buy ${coin.symbol.toUpperCase()}` : `Sell ${coin.symbol.toUpperCase()}`}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={statCard}>
            <div className="mb-1 flex items-center gap-2 text-xs text-zinc-400">
              <Activity size={14} /> Market Cap
            </div>
            <div className="text-lg font-black">{renderSelectedCompactAmount(marketCapDisplay, 12)}</div>
          </div>
          <div className={statCard}>
            <div className="mb-1 flex items-center gap-2 text-xs text-zinc-400">
              <BarChart3 size={14} /> Volume (24h)
            </div>
            <div className="text-lg font-black">{renderSelectedCompactAmount(totalVolumeDisplay, 12)}</div>
          </div>
          <div className={statCard}>
            <div className="mb-1 flex items-center gap-2 text-xs text-zinc-400">
              <TrendingUp size={14} /> 24h High
            </div>
            <div className="text-lg font-black">{formatSelectedAmount(high24hDisplay)}</div>
          </div>
          <div className={statCard}>
            <div className="mb-1 flex items-center gap-2 text-xs text-zinc-400">
              <TrendingDown size={14} /> 24h Low
            </div>
            <div className="text-lg font-black">{formatSelectedAmount(low24hDisplay)}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Overview</div>
            <h3 className="mt-1 text-xl font-black tracking-tight">About {coin.name}</h3>
          </div>

          <div className="space-y-3">
            <div className={cn("rounded-[28px] p-4", glassPanel)}>
              <p className="text-sm leading-6 text-zinc-300" data-testid="text-demo-coin-description">{descriptionText}</p>
            </div>

            <div className={cn("flex items-center justify-between rounded-[22px] p-4", glassPanel)}>
              <span className="flex items-center gap-2 text-sm text-zinc-400">
                <Layers size={16} /> Rank
              </span>
              <span className="font-black">#{coin.market_cap_rank}</span>
            </div>

            <div className={cn("flex items-center justify-between rounded-[22px] p-4", glassPanel)}>
              <span className="flex items-center gap-2 text-sm text-zinc-400">
                <Calendar size={16} /> Created
              </span>
              <span className="font-black">
                {coin.genesis_date ? new Date(coin.genesis_date).toLocaleDateString() : "N/A"}
              </span>
            </div>

            <div className={cn("flex items-center justify-between rounded-[22px] p-4", glassPanel)}>
              <span className="flex items-center gap-2 text-sm text-zinc-400">
                <DollarSign size={16} /> Website
              </span>
              <a
                href={coin.links.homepage[0]}
                target="_blank"
                rel="noreferrer"
                className="max-w-[150px] truncate text-sm text-zinc-100 hover:underline"
                data-testid="link-demo-coin-website"
              >
                {coin.links.homepage[0]?.replace("https://", "") || "N/A"}
              </a>
            </div>
          </div>

          <div className={cn("rounded-[28px] p-4", glassPanel)}>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-black">
              <DollarSign size={16} className="text-zinc-300" /> Supported Chains
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.keys(coin.platforms).length > 0 ? (
                Object.keys(coin.platforms).slice(0, 5).map((chain) => (
                  chain ? (
                    <span key={chain} className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs capitalize text-zinc-200">
                      {chain}
                    </span>
                  ) : null
                ))
              ) : (
                <span className="text-xs text-zinc-500">Native Chain ({coin.name})</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black/95 p-4 text-white backdrop-blur-2xl animate-in fade-in duration-200">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">{coin.name}</h2>
              <span className="text-sm uppercase tracking-[0.18em] text-zinc-400">{coin.symbol}</span>
            </div>
            <button onClick={() => setIsFullscreen(false)} className="rounded-full border border-white/10 bg-white/8 p-2 text-white hover:bg-white/14" data-testid="button-close-demo-chart-fullscreen">
              <X size={24} />
            </button>
          </div>
          <div className="relative flex-1 rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="demoChartFullscreenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(val) => formatDate(new Date(val), selectedTimeframe.days === "1" ? "HH:mm" : "MMM d")}
                  stroke="#71717a"
                />
                <YAxis
                  domain={["auto", "auto"]}
                  stroke="#71717a"
                  tickFormatter={(val) => formatSelectedAmount(val).replace(/\.00$/, "")}
                  width={72}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "16px", color: "#fff" }}
                  labelFormatter={(label) => new Date(label).toLocaleString()}
                  formatter={(value: number) => [formatSelectedAmount(value), "Price"]}
                />
                <Area type="monotone" dataKey="price" stroke="#06b6d4" strokeWidth={2.25} fillOpacity={1} fill="url(#demoChartFullscreenGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
