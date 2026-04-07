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

  const currentPriceDisplay = coin ? convert(coin.current_price) : 0;
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

  const tradeValueUsd = amount ? convert(Number(amount) || 0, currency, "USD") : 0;
  const estimatedCoinAmount = coin && tradeValueUsd > 0 ? tradeValueUsd / coin.current_price : 0;

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
    return <div className="min-h-screen bg-black flex items-center justify-center text-white"><div className="text-purple-500 font-bold text-sm animate-pulse">LOADING...</div></div>;
  }

  if (!coin) {
    return <div className="min-h-screen bg-black text-white p-8">Coin not found</div>;
  }

  const isPositive = coin.price_change_percentage_24h >= 0;
  const chartColor = isPositive ? "#22c55e" : "#ef4444";

  return (
    <div className="min-h-screen bg-black text-white pb-32 font-sans overflow-hidden">
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-md pt-4 px-4 pb-3 border-b border-white/5">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/demo-trading">
              <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-white font-bold text-sm" data-testid="button-back-demo-trading">
                {"<"} BACK
              </button>
            </Link>
            <div className="flex items-center gap-3 min-w-0">
              <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
              <div className="min-w-0">
                <h1 className="font-bold text-lg leading-tight truncate">{coin.name}</h1>
                <p className="text-[10px] text-gray-400 tracking-wider font-bold">DEMO TRADING</p>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-bold text-lg flex items-center justify-end gap-1">
              <VaultyIcon size={14} />
              {currentPriceDisplay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={cn("text-xs font-bold flex items-center justify-end gap-1", isPositive ? "text-green-500" : "text-red-400")}>
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-[#111] border border-white/5 p-3">
            <div className="text-[11px] uppercase tracking-wide text-zinc-500">Holding</div>
            <div className="mt-2 text-sm font-bold" data-testid="text-demo-holding-amount">{holding ? holding.amount.toFixed(6) : "0.000000"}</div>
          </div>
          <div className="rounded-2xl bg-[#111] border border-white/5 p-3">
            <div className="text-[11px] uppercase tracking-wide text-zinc-500">Value</div>
            <div className="mt-2 text-sm font-bold flex items-center gap-1" data-testid="text-demo-holding-value">
              <VaultyIcon size={12} />
              {holdingValueDisplay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="rounded-2xl bg-[#111] border border-white/5 p-3">
            <div className="text-[11px] uppercase tracking-wide text-zinc-500">P/L</div>
            <div className={cn("mt-2 text-sm font-bold flex items-center gap-1", profitDisplay >= 0 ? "text-green-400" : "text-red-400")} data-testid="text-demo-holding-profit">
              <VaultyIcon size={12} />
              {Math.abs(profitDisplay).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-[#111] border border-white/5 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Tracking</p>
              <h2 className="text-lg font-bold">Position overview</h2>
            </div>
            <div className="text-right text-xs text-zinc-500">
              <div>Avg Entry</div>
              <div className="text-white font-semibold flex items-center justify-end gap-1 mt-1">
                <VaultyIcon size={12} />
                {averageBuyPriceDisplay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-black/40 border border-white/5 p-3">
              <div className="text-zinc-500 text-xs uppercase tracking-wide">Cost basis</div>
              <div className="mt-2 font-bold flex items-center gap-1">
                <VaultyIcon size={12} />
                {costBasisDisplay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="rounded-2xl bg-black/40 border border-white/5 p-3">
              <div className="text-zinc-500 text-xs uppercase tracking-wide">Return</div>
              <div className={cn("mt-2 font-bold", profitPercent >= 0 ? "text-green-400" : "text-red-400")}>
                {profitPercent >= 0 ? "+" : "-"}
                {Math.abs(profitPercent).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-[#111] border border-white/5 p-4">
          <div className="flex justify-between bg-black p-1 rounded-xl mb-4">
            {TIMEFRAMES.map((timeframe) => (
              <button
                key={timeframe.label}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={cn(
                  "flex-1 py-2 rounded-lg text-xs font-semibold transition-all",
                  selectedTimeframe.label === timeframe.label ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300",
                )}
                data-testid={`button-demo-timeframe-${timeframe.label.toLowerCase()}`}
              >
                {timeframe.label}
              </button>
            ))}
          </div>

          <div className="h-[280px] w-full relative group">
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute top-2 right-2 z-10 p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
              data-testid="button-demo-chart-fullscreen"
            >
              <Maximize2 size={16} />
            </button>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="demoChartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="x" type="number" domain={["dataMin", "dataMax"]} hide />
                <YAxis domain={["auto", "auto"]} hide />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "16px" }}
                  labelFormatter={(label) => new Date(label).toLocaleString()}
                  formatter={(value: number) => [convert(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), "Price"]}
                />
                <Area type="monotone" dataKey="y" stroke={chartColor} strokeWidth={2} fill={`url(#demoChartGradient)`} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-black">
        <div className="max-w-md mx-auto relative z-10">
          <div className="bg-[#111] border border-white/10 rounded-[2rem] p-5 space-y-5">
            <div className="grid grid-cols-2 p-1 bg-black rounded-xl">
              <button
                onClick={() => setTradeType("buy")}
                className={cn("py-3 rounded-lg font-bold text-sm transition-all", tradeType === "buy" ? "bg-[#22c55e] text-black shadow-lg shadow-green-500/20" : "text-gray-500 hover:text-gray-300")}
                data-testid="button-trade-type-buy"
              >
                Buy
              </button>
              <button
                onClick={() => setTradeType("sell")}
                className={cn("py-3 rounded-lg font-bold text-sm transition-all", tradeType === "sell" ? "bg-[#ef4444] text-white shadow-lg shadow-red-500/20" : "text-gray-500 hover:text-gray-300")}
                data-testid="button-trade-type-sell"
              >
                Sell
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-500 ml-1">Amount in {currency}</label>
              <div className="relative bg-black rounded-2xl border border-white/10 flex items-center px-4 py-4 gap-3">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  className="w-full bg-transparent text-2xl font-bold text-white placeholder:text-gray-600 focus:outline-none"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  data-testid="input-demo-trade-amount"
                />
                <button
                  onClick={setMaxAmount}
                  className="text-xs font-bold text-purple-400 hover:text-purple-300 px-2 py-1 rounded hover:bg-white/5 transition-colors"
                  data-testid="button-demo-trade-max"
                >
                  MAX
                </button>
              </div>
              <div className="flex justify-between px-1 text-xs">
                <span className="text-gray-500">Available</span>
                <span className="text-white font-mono flex items-center gap-1" data-testid="text-demo-available-trade-value">
                  <VaultyIcon size={10} />
                  {availableTradeValueDisplay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between px-1 text-xs">
                <span className="text-gray-500">Estimated</span>
                <span className="text-white font-mono" data-testid="text-demo-estimated-coin-amount">{estimatedCoinAmount.toFixed(6)} {coin.symbol.toUpperCase()}</span>
              </div>
            </div>

            <Button
              className={cn(
                "w-full h-14 rounded-2xl text-lg font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]",
                tradeType === "buy"
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-black hover:from-green-400 hover:to-green-500"
                  : "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-400 hover:to-red-500",
              )}
              onClick={handleTrade}
              data-testid="button-submit-demo-trade"
            >
              {tradeType === "buy" ? `Buy ${coin.symbol.toUpperCase()}` : `Sell ${coin.symbol.toUpperCase()}`}
            </Button>
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
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="x"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(value) => formatDate(new Date(value), selectedTimeframe.days > 1 ? "MMM d" : "HH:mm")}
                  stroke="#555"
                />
                <YAxis stroke="#555" width={64} tickFormatter={(value) => convert(value).toFixed(0)} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "12px" }}
                  labelFormatter={(label) => new Date(label).toLocaleString()}
                  formatter={(value: number) => [convert(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), "Price"]}
                />
                <Area type="monotone" dataKey="y" stroke={chartColor} strokeWidth={2} fill="url(#demoChartFullscreenGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
