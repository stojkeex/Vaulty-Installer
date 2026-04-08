import { useMemo, useState } from "react";
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

const formatCompactNumber = (number: number) => {
  if (number === 0) return "0";
  if (!number) return "N/A";
  const formatter = Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 });
  return formatter.format(number);
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
  const { balance, holdings, buyCoin, sellCoin } = useDemoStore();
  const { currency, convert } = useCurrency();
  const { toast } = useToast();

  const [selectedTimeframe, setSelectedTimeframe] = useState(TIMEFRAMES[1]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [amount, setAmount] = useState("");
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");

  const isVaultyCredits = currency === "VC";

  const { data: coin, isLoading: loadingCoin, refetch: refetchCoin } = useQuery({
    queryKey: ["demoCoinDetail", coinId],
    queryFn: async () => {
      if (coinId === VAULTY_COIN_ID) {
        return getVaultyCoinDetail();
      }

      const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
      if (!res.ok) throw new Error("Failed to fetch coin data");
      return res.json();
    },
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
        price: price,
      }));
    },
  });

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

  if (loadingCoin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-sky-400"></div>
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
          description: `Bought ${coinsToTrade.toFixed(6)} ${coin.symbol.toUpperCase()}`,
        });
      } else {
        sellCoin(coin.id, coin.symbol, coinsToTrade, currentPriceUsd);
        toast({
          title: "Sell order filled",
          description: `Sold ${coinsToTrade.toFixed(6)} ${coin.symbol.toUpperCase()}`,
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

  const chartTone = "#60a5fa";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.14),transparent_28%),linear-gradient(180deg,#05070b_0%,#000_100%)] pb-10 text-white">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-black/80 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center gap-4">
          <Link href="/demo-trading">
            <button
              className="rounded-full bg-white/5 p-2 transition-colors hover:bg-white/10"
              data-testid="button-back-demo-coin-detail"
            >
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div className="flex items-center gap-3 min-w-0">
            <img src={coin.image.small} alt={coin.name} className="h-9 w-9 rounded-full" />
            <div>
              <h1 className="font-bold text-lg leading-none">{coin.name}</h1>
              <span className="text-xs text-gray-400 uppercase">{coin.symbol}</span>
            </div>
          </div>
          <div className="ml-auto flex flex-col items-end">
            <span className="font-bold text-lg">{formatSelectedAmount(currentPriceDisplay)}</span>
            <span className={cn("text-xs flex items-center", isPositive ? "text-sky-300" : "text-sky-200")}>
              {isPositive ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
              {Math.abs(priceChange).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-md mx-auto">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <div className="text-[11px] uppercase tracking-wide text-zinc-500">Holding</div>
            <div className="mt-2 text-sm font-bold" data-testid="text-demo-holding-amount">{holdingAmount.toFixed(6)}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <div className="text-[11px] uppercase tracking-wide text-zinc-500">Value</div>
            <div className="mt-2 flex items-center gap-1 text-sm font-bold" data-testid="text-demo-holding-value">
              {renderSelectedAmount(holdingValueDisplay, 12)}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <div className="text-[11px] uppercase tracking-wide text-zinc-500">P/L</div>
            <div className="mt-2 flex items-center gap-1 text-sm font-bold text-sky-300" data-testid="text-demo-holding-profit">
              {renderSelectedAmount(Math.abs(profitDisplay), 12)}
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_14px_40px_rgba(0,0,0,0.24)]">
          <div className="h-[250px] w-full -mx-2 relative group">
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute top-2 right-2 z-10 rounded-lg bg-black/50 p-2 text-white transition-opacity hover:bg-black/70 opacity-0 group-hover:opacity-100"
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
                    <linearGradient id="demoTradeChartColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartTone} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={chartTone} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide type="number" domain={["dataMin", "dataMax"]} />
                  <YAxis hide domain={["auto", "auto"]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px" }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    formatter={(value: number) => [formatSelectedAmount(value), "Price"]}
                  />
                  <Area type="monotone" dataKey="price" stroke={chartTone} strokeWidth={2} fillOpacity={1} fill="url(#demoTradeChartColor)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex justify-between rounded-xl bg-white/5 p-1">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.label}
                onClick={() => setSelectedTimeframe(tf)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  selectedTimeframe.value === tf.value
                    ? "bg-sky-400 text-slate-950 shadow-sm"
                    : "text-gray-500 hover:text-gray-300"
                )}
                data-testid={`button-demo-timeframe-${tf.label.toLowerCase()}`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_14px_40px_rgba(0,0,0,0.24)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Demo trading</p>
              <h2 className="text-xl font-black">Buy or sell {coin.symbol.toUpperCase()}</h2>
            </div>
            <div className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300">
              Paper trades
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 rounded-2xl border border-white/6 bg-black/35 p-1.5">
            <button
              onClick={() => setTradeType("buy")}
              className={cn(
                "rounded-xl py-3 text-sm font-bold transition-all",
                tradeType === "buy"
                  ? "bg-sky-500 text-slate-950 shadow-[0_10px_28px_rgba(96,165,250,0.35)]"
                  : "text-zinc-400 hover:text-white"
              )}
              data-testid="button-trade-type-buy"
            >
              Buy
            </button>
            <button
              onClick={() => setTradeType("sell")}
              className={cn(
                "rounded-xl py-3 text-sm font-bold transition-all",
                tradeType === "sell"
                  ? "bg-sky-400/90 text-slate-950 shadow-[0_10px_28px_rgba(96,165,250,0.28)]"
                  : "text-zinc-400 hover:text-white"
              )}
              data-testid="button-trade-type-sell"
            >
              Sell
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div className="rounded-2xl bg-black/30 border border-white/5 p-4">
              <div className="text-xs uppercase tracking-wide text-zinc-500">Avg entry</div>
              <div className="mt-2 font-bold text-white">{formatSelectedAmount(averageBuyPriceDisplay)}</div>
            </div>
            <div className="rounded-2xl bg-black/30 border border-white/5 p-4">
              <div className="text-xs uppercase tracking-wide text-zinc-500">Return</div>
              <div className="mt-2 font-bold text-sky-300">{profitPercent >= 0 ? "+" : "-"}{Math.abs(profitPercent).toFixed(2)}%</div>
            </div>
            <div className="rounded-2xl bg-black/30 border border-white/5 p-4 col-span-2">
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-zinc-500">
                <span>Cost basis</span>
                <span className="text-sky-300">Live holding</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="font-bold text-white">{formatSelectedAmount(costBasisDisplay)}</span>
                <span className="font-bold text-white">{renderSelectedAmount(holdingValueDisplay, 12)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="ml-1 text-xs text-gray-400">Amount in {isVaultyCredits ? "Vaulty Credits" : currency}</label>
            <div className="flex items-center gap-3 rounded-[24px] border border-white/8 bg-black/35 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
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
                className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-xs font-bold text-sky-300 transition-colors hover:bg-sky-400/20"
                data-testid="button-demo-trade-max"
              >
                MAX
              </button>
            </div>

            <div className="space-y-2 rounded-[24px] border border-white/6 bg-black/25 p-4 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">Available</span>
                <span className="flex items-center gap-1 font-mono text-white" data-testid="text-demo-available-trade-value">
                  {renderSelectedAmount(availableTradeValueDisplay, 10)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">Estimated</span>
                <span className="font-mono text-white" data-testid="text-demo-estimated-coin-amount">{estimatedCoinAmount.toFixed(6)} {coin.symbol.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <Button
            className="mt-5 h-14 w-full rounded-[24px] bg-gradient-to-r from-sky-500 to-blue-500 text-base font-black text-slate-950 shadow-[0_16px_36px_rgba(59,130,246,0.35)] transition-all hover:from-sky-400 hover:to-blue-400 hover:scale-[1.01] active:scale-[0.99]"
            onClick={handleTrade}
            data-testid="button-submit-demo-trade"
          >
            {tradeType === "buy" ? `Buy ${coin.symbol.toUpperCase()}` : `Sell ${coin.symbol.toUpperCase()}`}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <Activity size={14} /> Market Cap
            </div>
            <div className="font-bold text-lg">{formatCompactNumber(marketCapDisplay)}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <BarChart3 size={14} /> Volume (24h)
            </div>
            <div className="font-bold text-lg">{formatCompactNumber(totalVolumeDisplay)}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <TrendingUp size={14} /> 24h High
            </div>
            <div className="font-bold text-lg">{formatSelectedAmount(high24hDisplay)}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <TrendingDown size={14} /> 24h Low
            </div>
            <div className="font-bold text-lg">{formatSelectedAmount(low24hDisplay)}</div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-lg">About {coin.name}</h3>

          <div className="space-y-3">
            <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
              <p className="text-sm leading-6 text-gray-300" data-testid="text-demo-coin-description">{descriptionText}</p>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3">
              <span className="flex items-center gap-2 text-sm text-gray-400">
                <Layers size={16} /> Rank
              </span>
              <span className="font-bold">#{coin.market_cap_rank}</span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3">
              <span className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar size={16} /> Created
              </span>
              <span className="font-bold">
                {coin.genesis_date ? new Date(coin.genesis_date).toLocaleDateString() : "N/A"}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3">
              <span className="flex items-center gap-2 text-sm text-gray-400">
                <DollarSign size={16} /> Website
              </span>
              <a
                href={coin.links.homepage[0]}
                target="_blank"
                rel="noreferrer"
                className="max-w-[150px] truncate text-sm text-sky-300 hover:underline"
                data-testid="link-demo-coin-website"
              >
                {coin.links.homepage[0]?.replace("https://", "") || "N/A"}
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-bold">
              <DollarSign size={16} className="text-sky-300" /> Supported Chains
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.keys(coin.platforms).length > 0 ? (
                Object.keys(coin.platforms).slice(0, 5).map((chain) => (
                  chain ? (
                    <span key={chain} className="rounded-md bg-white/10 px-2 py-1 text-xs capitalize text-gray-300">
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
                  <linearGradient id="demoChartFullscreenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartTone} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={chartTone} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(val) => formatDate(new Date(val), selectedTimeframe.days === "1" ? "HH:mm" : "MMM d")}
                  stroke="#64748b"
                />
                <YAxis
                  domain={["auto", "auto"]}
                  stroke="#64748b"
                  tickFormatter={(val) => formatSelectedAmount(val).replace(/\.00$/, "")}
                  width={72}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px" }}
                  labelFormatter={(label) => new Date(label).toLocaleString()}
                  formatter={(value: number) => [formatSelectedAmount(value), "Price"]}
                />
                <Area type="monotone" dataKey="price" stroke={chartTone} strokeWidth={2} fillOpacity={1} fill="url(#demoChartFullscreenGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
