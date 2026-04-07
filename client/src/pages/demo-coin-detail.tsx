import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownRight, ArrowUpRight, Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useDemoStore } from "@/hooks/use-demo-store";
import { getCoinDetail, getMarketChart, type Coin } from "@/lib/coingecko";
import { cn } from "@/lib/utils";
import { useCurrency, type CurrencyCode } from "@/contexts/currency-context";
import { format as formatDate } from "date-fns";
import { VaultyIcon } from "@/components/ui/vaulty-icon";

const formatUsd = (amount: number) => `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const TIMEFRAMES = [
  { label: "1D", days: 1 },
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
];

export default function DemoCoinDetail() {
  const [, params] = useRoute("/demo-trading/:id");
  const { balance, holdings, buyCoin, sellCoin } = useDemoStore();
  const { currency, convert } = useCurrency();
  const [coin, setCoin] = useState<Coin | null>(null);
  const [chartData, setChartData] = useState<{ x: number; y: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [selectedTimeframe, setSelectedTimeframe] = useState(TIMEFRAMES[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();

  const id = params?.id;
  const isVaultyCredits = currency === "VC";

  useEffect(() => {
    if (!id) {
      return;
    }

    const loadCoin = async () => {
      setLoading(true);

      try {
        const [coinData, marketChart] = await Promise.all([
          getCoinDetail(id, "usd"),
          getMarketChart(id, selectedTimeframe.days, "usd"),
        ]);

        setCoin(coinData);
        setChartData(marketChart);
      } finally {
        setLoading(false);
      }
    };

    loadCoin();
  }, [id, selectedTimeframe.days]);

  const holding = useMemo(() => holdings.find((item) => item.coinId === coin?.id), [holdings, coin?.id]);

  const holdingValueDisplay = coin && holding ? convert(holding.amount * coin.current_price) : 0;
  const averageBuyPriceDisplay = holding ? convert(holding.averageBuyPrice) : 0;
  const costBasisDisplay = holding ? convert(holding.amount * holding.averageBuyPrice) : 0;
  const profitDisplay = holding && coin ? convert(holding.amount * (coin.current_price - holding.averageBuyPrice)) : 0;
  const profitPercent = holding && coin && holding.averageBuyPrice > 0
    ? ((coin.current_price - holding.averageBuyPrice) / holding.averageBuyPrice) * 100
    : 0;

  const availableTradeValueDisplay = tradeType === "buy"
    ? convert(balance)
    : coin && holding
      ? convert(holding.amount * coin.current_price)
      : 0;

  const tradeValueUsd = amount ? convert(Number(amount) || 0, currency as CurrencyCode, "USD") : 0;
  const estimatedCoinAmount = coin && tradeValueUsd > 0 ? tradeValueUsd / coin.current_price : 0;

  const formatSelectedAmount = (amountToFormat: number) => {
    if (isVaultyCredits) {
      return amountToFormat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
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

  const formatSelectedPriceFromUsd = (usdAmount: number) => formatSelectedAmount(convert(usdAmount));

  const handleTrade = () => {
    if (!coin || !amount) {
      return;
    }

    try {
      const displayAmount = Number(amount);

      if (!Number.isFinite(displayAmount) || displayAmount <= 0) {
        throw new Error("Enter a valid amount");
      }

      const usdTradeValue = convert(displayAmount, currency as CurrencyCode, "USD");
      const coinsToTrade = usdTradeValue / coin.current_price;

      if (!Number.isFinite(coinsToTrade) || coinsToTrade <= 0) {
        throw new Error("Unable to calculate trade size");
      }

      if (tradeType === "buy") {
        buyCoin(coin.id, coin.symbol, coinsToTrade, coin.current_price);
        toast({
          title: "Buy order filled",
          description: `Bought ${coinsToTrade.toFixed(6)} ${coin.symbol.toUpperCase()}`,
        });
      } else {
        sellCoin(coin.id, coin.symbol, coinsToTrade, coin.current_price);
        toast({
          title: "Sell order filled",
          description: `Sold ${coinsToTrade.toFixed(6)} ${coin.symbol.toUpperCase()}`,
        });
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

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white"><div className="text-sky-400 font-bold text-sm animate-pulse">LOADING...</div></div>;
  }

  if (!coin) {
    return <div className="min-h-screen bg-black text-white p-8">Coin not found</div>;
  }

  const isPositive = coin.price_change_percentage_24h >= 0;
  const chartColor = "#60a5fa";
  const secondaryBlue = "#93c5fd";

  return (
    <div className="min-h-screen overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.12),transparent_28%),linear-gradient(180deg,#05070b_0%,#000_100%)] pb-10 font-sans text-white">
      <div className="sticky top-0 z-50 border-b border-white/5 bg-black/80 px-4 pb-3 pt-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/demo-trading">
              <button className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10" data-testid="button-back-demo-trading">
                {"<"} BACK
              </button>
            </Link>
            <div className="flex min-w-0 items-center gap-3">
              <img src={coin.image} alt={coin.name} className="h-11 w-11 rounded-full ring-1 ring-white/10" />
              <div className="min-w-0">
                <h1 className="truncate text-lg font-black leading-tight">{coin.name}</h1>
                <p className="text-[10px] font-bold tracking-[0.22em] text-zinc-500">DEMO TRADING</p>
              </div>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-lg font-black text-white">
              {formatSelectedPriceFromUsd(coin.current_price)}
            </div>
            <div className="flex items-center justify-end gap-1 text-xs font-bold text-sky-300">
              {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md space-y-5 px-4 pt-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[26px] border border-white/8 bg-white/[0.05] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <div className="text-[11px] uppercase tracking-wide text-zinc-500">Holding</div>
            <div className="mt-2 text-sm font-bold" data-testid="text-demo-holding-amount">{holding ? holding.amount.toFixed(6) : "0.000000"}</div>
          </div>
          <div className="rounded-[26px] border border-white/8 bg-white/[0.05] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <div className="text-[11px] uppercase tracking-wide text-zinc-500">Value</div>
            <div className="mt-2 flex items-center gap-1 text-sm font-bold text-white" data-testid="text-demo-holding-value">
              {renderSelectedAmount(holdingValueDisplay, 12)}
            </div>
          </div>
          <div className="rounded-[26px] border border-white/8 bg-white/[0.05] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <div className="text-[11px] uppercase tracking-wide text-zinc-500">P/L</div>
            <div className="mt-2 flex items-center gap-1 text-sm font-bold text-sky-300" data-testid="text-demo-holding-profit">
              {renderSelectedAmount(Math.abs(profitDisplay), 12)}
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/8 bg-white/[0.05] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Tracking</p>
              <h2 className="text-[1.75rem] font-black leading-none tracking-tight">Position overview</h2>
            </div>
            <div className="text-right text-xs text-zinc-500">
              <div>Avg Entry</div>
              <div className="mt-1 font-semibold text-white">
                {formatSelectedAmount(averageBuyPriceDisplay)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-[24px] border border-white/6 bg-black/30 p-4">
              <div className="text-xs uppercase tracking-wide text-zinc-500">Cost basis</div>
              <div className="mt-2 flex items-center gap-1 font-bold text-white">
                {renderSelectedAmount(costBasisDisplay, 12)}
              </div>
            </div>
            <div className="rounded-[24px] border border-white/6 bg-black/30 p-4">
              <div className="text-xs uppercase tracking-wide text-zinc-500">Return</div>
              <div className="mt-2 font-bold text-sky-300">
                {profitPercent >= 0 ? "+" : "-"}
                {Math.abs(profitPercent).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/8 bg-white/[0.05] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Market</p>
              <h2 className="text-xl font-black">Live chart</h2>
            </div>
            <button
              onClick={() => setIsFullscreen(true)}
              className="rounded-full border border-white/10 bg-white/5 p-2 text-white transition-colors hover:bg-white/10"
              data-testid="button-demo-chart-fullscreen"
            >
              <Maximize2 size={16} />
            </button>
          </div>

          <div className="mb-4 flex justify-between rounded-2xl border border-white/6 bg-black/35 p-1.5">
            {TIMEFRAMES.map((timeframe) => (
              <button
                key={timeframe.label}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={cn(
                  "flex-1 rounded-xl py-2.5 text-xs font-bold transition-all",
                  selectedTimeframe.label === timeframe.label
                    ? "bg-sky-500 text-slate-950 shadow-[0_8px_24px_rgba(96,165,250,0.35)]"
                    : "text-zinc-400 hover:text-white"
                )}
                data-testid={`button-demo-timeframe-${timeframe.label.toLowerCase()}`}
              >
                {timeframe.label}
              </button>
            ))}
          </div>

          <div className="h-[300px] w-full overflow-hidden rounded-[26px] border border-white/6 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.92))] p-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="demoChartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="x" type="number" domain={["dataMin", "dataMax"]} hide />
                <YAxis domain={["auto", "auto"]} hide />
                <Tooltip
                  contentStyle={{ backgroundColor: "#020617", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px" }}
                  labelFormatter={(label) => new Date(label).toLocaleString()}
                  formatter={(value: number) => [formatSelectedPriceFromUsd(value), "Price"]}
                />
                <Area type="monotone" dataKey="y" stroke={chartColor} strokeWidth={2.5} fill="url(#demoChartGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/8 bg-white/[0.05] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Trade panel</p>
              <h2 className="text-xl font-black">Buy or sell {coin.symbol.toUpperCase()}</h2>
            </div>
            <div className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300">
              Scroll enabled
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

          <div className="space-y-3">
            <label className="ml-1 text-xs text-gray-400">
              Amount in {isVaultyCredits ? "Vaulty Credits" : currency}
            </label>
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
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-[60] animate-in fade-in duration-200 bg-black p-4 flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">{coin.name}</h2>
              <span className="text-sm uppercase text-gray-400">{coin.symbol}</span>
            </div>
            <button onClick={() => setIsFullscreen(false)} className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20" data-testid="button-close-demo-chart-fullscreen">
              <X size={24} />
            </button>
          </div>
          <div className="relative flex-1 rounded-[28px] border border-white/8 bg-slate-950/90 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="demoChartFullscreenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={secondaryBlue} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={secondaryBlue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="x"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(value) => formatDate(new Date(value), selectedTimeframe.days > 1 ? "MMM d" : "HH:mm")}
                  stroke="#64748b"
                />
                <YAxis
                  stroke="#64748b"
                  width={72}
                  tickFormatter={(value) => formatSelectedAmount(convert(value)).replace(/\.00$/, "")}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#020617", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px" }}
                  labelFormatter={(label) => new Date(label).toLocaleString()}
                  formatter={(value: number) => [formatSelectedPriceFromUsd(value), "Price"]}
                />
                <Area type="monotone" dataKey="y" stroke={secondaryBlue} strokeWidth={2.5} fill="url(#demoChartFullscreenGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
