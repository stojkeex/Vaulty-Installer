import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { RefreshCcw, Search, Wallet, PieChart, Activity, ArrowUpRight, ArrowDownRight, Brain, TrendingUp, TrendingDown } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { useDemoStore, INITIAL_DEMO_BALANCE } from "@/hooks/use-demo-store";
import { getCoinsByIds, getTopCoins, searchCoins, type Coin } from "@/lib/coingecko";
import { cn } from "@/lib/utils";
import { useCurrency, type CurrencyCode } from "@/contexts/currency-context";
import { VaultyIcon } from "@/components/ui/vaulty-icon";

const formatUsd = (amount: number) => `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

const demoCurrencyOptions: Array<{ value: CurrencyCode; label: string }> = [
  { value: "VC", label: "VC" },
  { value: "EUR", label: "EUR" },
  { value: "USD", label: "USD" },
];

const OVERVIEW_CHART_DATA = [
  { price: 4000 },
  { price: 4200 },
  { price: 3900 },
  { price: 4600 },
  { price: 4500 },
  { price: 5000 },
  { price: 5200 },
  { price: 5800 },
];

export default function DemoTrading() {
  const { balance, holdings, transactions, resetAccount, isHydrated } = useDemoStore();
  const { currency, setCurrency, convert } = useCurrency();
  const [coins, setCoins] = useState<Coin[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resetting, setResetting] = useState(false);

  const holdingIds = useMemo(() => holdings.map((holding) => holding.coinId), [holdings]);

  const loadCoins = async (query: string = "") => {
    setLoading(true);
    setError("");

    try {
      const marketCoins = query.trim() ? await searchCoins(query, "usd") : await getTopCoins("usd");
      const knownIds = new Set(marketCoins.map((coin) => coin.id));
      const missingHoldingIds = holdingIds.filter((id) => !knownIds.has(id));
      const holdingCoins = missingHoldingIds.length ? await getCoinsByIds(missingHoldingIds, "usd") : [];
      const mergedCoins = [...marketCoins, ...holdingCoins].filter(
        (coin, index, array) => array.findIndex((item) => item.id === coin.id) === index,
      );

      setCoins(mergedCoins);
    } catch (loadError) {
      console.error(loadError);
      setError("Market data is temporarily unavailable.");
      setCoins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoins();
  }, []);

  useEffect(() => {
    if (!holdingIds.length) {
      return;
    }

    loadCoins(searchQuery);
  }, [holdingIds.join(",")]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadCoins(searchQuery);
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, [searchQuery, holdingIds.join(",")]);

  const enrichedHoldings = useMemo(() => {
    return holdings
      .map((holding) => {
        const coin = coins.find((item) => item.id === holding.coinId);
        const currentPriceUsd = coin?.current_price ?? holding.averageBuyPrice;
        const currentValueUsd = holding.amount * currentPriceUsd;
        const costBasisUsd = holding.amount * holding.averageBuyPrice;
        const profitUsd = currentValueUsd - costBasisUsd;
        const profitPercent = costBasisUsd > 0 ? (profitUsd / costBasisUsd) * 100 : 0;

        return {
          holding,
          coin,
          currentPriceUsd,
          currentValueUsd,
          costBasisUsd,
          profitUsd,
          profitPercent,
        };
      })
      .sort((a, b) => b.currentValueUsd - a.currentValueUsd);
  }, [holdings, coins]);

  const portfolioValueUsd = useMemo(
    () => enrichedHoldings.reduce((total, item) => total + item.currentValueUsd, 0),
    [enrichedHoldings],
  );

  const totalBalanceUsd = balance + portfolioValueUsd;
  const totalProfitUsd = totalBalanceUsd - INITIAL_DEMO_BALANCE;
  const totalProfitPercent = (totalProfitUsd / INITIAL_DEMO_BALANCE) * 100;
  const totalBalance = convert(totalBalanceUsd);
  const cashBalance = convert(balance);
  const investedBalance = convert(portfolioValueUsd);
  const totalProfit = convert(totalProfitUsd);
  const isVaultyCredits = currency === "VC";

  const formatSelectedAmount = (amount: number) => {
    const fractionDigits = getPriceFractionOptions(amount);

    if (isVaultyCredits) {
      return amount.toLocaleString(undefined, fractionDigits);
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      ...fractionDigits,
    }).format(amount);
  };

  const formatSelectedPrice = (amount: number) => formatSelectedAmount(convert(amount));

  const formatSelectedCompactAmount = (amount: number) => {
    if (amount === 0) {
      return isVaultyCredits ? "0" : new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(0);
    }

    if (Math.abs(amount) < 1000) {
      return formatSelectedAmount(amount);
    }

    if (isVaultyCredits) {
      return new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 2,
      }).format(amount);
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatCryptoAmount = (amount: number) => {
    if (amount === 0) return "0";
    if (Math.abs(amount) < 0.000001) return amount.toExponential(4);
    if (Math.abs(amount) < 0.01) return amount.toFixed(6);
    if (Math.abs(amount) < 1) return amount.toFixed(4);
    if (Math.abs(amount) < 1000) return amount.toFixed(2);
    
    // For large crypto amounts like 63,970,606 XRP -> 63.97M
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const renderSelectedAmount = (amount: number, iconSize: number) => {
    if (isVaultyCredits) {
      return (
        <>
          <VaultyIcon size={iconSize} />
          {formatSelectedAmount(amount)}
        </>
      );
    }

    return formatSelectedAmount(amount);
  };

  const renderSelectedCompactAmount = (amount: number, iconSize: number) => {
    if (isVaultyCredits) {
      return (
        <>
          <VaultyIcon size={iconSize} />
          {formatSelectedCompactAmount(amount)}
        </>
      );
    }

    return formatSelectedCompactAmount(amount);
  };

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    await loadCoins(searchQuery);
  };

  const handleReset = () => {
    setResetting(true);
    resetAccount();
    setTimeout(() => setResetting(false), 300);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-32 font-sans selection:bg-purple-500/30">
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold">Demo Trading</h1>
            <p className="text-xs text-zinc-500">Live prices, paper trades, tracked holdings.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400"
              onClick={() => loadCoins(searchQuery)}
              data-testid="button-refresh-demo-trading"
            >
              <RefreshCcw className={cn("w-5 h-5", loading && "animate-spin")} />
            </button>
            <button
              className="px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-xs font-semibold text-zinc-300"
              onClick={handleReset}
              disabled={resetting}
              data-testid="button-reset-demo-account"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        <div className="relative overflow-hidden rounded-[32px] p-7 bg-gradient-to-b from-white/[0.05] to-transparent border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
          <div className="relative z-10 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-medium tracking-wide text-zinc-400 mb-1">Total Demo Balance</p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                  {isVaultyCredits ? "Vaulty Credits" : currency === "EUR" ? "Euro" : "Dollar"}
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-black/40 p-1 backdrop-blur-md">
                <div className="flex items-center gap-1">
                  {demoCurrencyOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setCurrency(option.value)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-[11px] font-bold transition-all",
                        currency === option.value
                          ? "bg-white text-black shadow-sm"
                          : "text-zinc-400 hover:bg-white/10 hover:text-white"
                      )}
                      data-testid={`button-demo-currency-${option.value.toLowerCase()}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div data-testid="text-demo-total-balance">
                <h3 className="text-[2.5rem] leading-none font-bold tracking-tight text-white flex items-center gap-2">
                  {renderSelectedAmount(totalBalance, 34)}
                </h3>
                {isVaultyCredits && (
                  <div className="mt-2 pl-11 text-sm font-semibold text-zinc-400">
                    {formatUsd(totalBalanceUsd)}
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.05] text-[13px] font-semibold", totalProfitUsd >= 0 ? "text-[#06b6d4]" : "text-rose-400")} data-testid="text-demo-profit-summary">
                  {totalProfitUsd >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {renderSelectedAmount(Math.abs(totalProfit), 10)}
                  <span>({Math.abs(totalProfitPercent).toFixed(2)}%)</span>
                </div>
                <span className="text-zinc-500 font-medium text-[13px]">Profit</span>
              </div>
            </div>
            
            {/* Chart Area */}
            <div className="h-[120px] w-full mt-4 -mx-2 relative z-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={OVERVIEW_CHART_DATA}>
                  <defs>
                    <linearGradient id="demoChartColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={totalProfitUsd >= 0 ? "#06b6d4" : "#f43f5e"} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={totalProfitUsd >= 0 ? "#06b6d4" : "#f43f5e"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke={totalProfitUsd >= 0 ? "#06b6d4" : "#f43f5e"} 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#demoChartColor)" 
                    isAnimationActive={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* AI Analysis Button */}
            <button className="w-full mt-2 flex items-center justify-center gap-2 bg-white text-black py-3.5 px-4 rounded-2xl font-bold text-[15px] hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              <Brain size={18} />
              Analysis with AI
            </button>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.05] p-3 backdrop-blur-sm">
                <div className="text-[11px] uppercase tracking-wide text-zinc-500 flex items-center gap-1">
                  <Wallet className="w-3 h-3" /> Cash
                </div>
                <div className="mt-2 text-sm font-bold flex items-center gap-1" data-testid="text-demo-cash-balance">
                  {renderSelectedCompactAmount(cashBalance, 12)}
                </div>
              </div>
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.05] p-3 backdrop-blur-sm">
                <div className="text-[11px] uppercase tracking-wide text-zinc-500 flex items-center gap-1">
                  <PieChart className="w-3 h-3" /> Holdings
                </div>
                <div className="mt-2 text-sm font-bold flex items-center gap-1" data-testid="text-demo-invested-balance">
                  {renderSelectedCompactAmount(investedBalance, 12)}
                </div>
              </div>
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.05] p-3 backdrop-blur-sm">
                <div className="text-[11px] uppercase tracking-wide text-zinc-500 flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Trades
                </div>
                <div className="mt-2 text-sm font-bold" data-testid="text-demo-trade-count">{transactions.length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-bold text-xl">Your Holdings</h2>
            <span className="text-xs text-zinc-500">{enrichedHoldings.length} positions</span>
          </div>

          {!isHydrated ? (
            <div className="text-center py-10 rounded-[24px] bg-white/[0.02] border border-white/[0.05] text-gray-500 backdrop-blur-sm">Loading portfolio...</div>
          ) : enrichedHoldings.length === 0 ? (
            <div className="text-center py-10 rounded-[24px] bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm">
              <p className="text-gray-500 text-sm">No active holdings yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {enrichedHoldings.map(({ holding, coin, currentValueUsd, profitUsd, profitPercent, currentPriceUsd }) => {
                const displayValue = convert(currentValueUsd);
                const displayProfit = convert(profitUsd);

                return (
                  <Link key={holding.coinId} href={`/demo-trading/${holding.coinId}`}>
                    <div className="flex items-center justify-between p-5 rounded-[24px] bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] active:scale-[0.98] transition-all cursor-pointer backdrop-blur-sm group" data-testid={`card-demo-holding-${holding.coinId}`}>
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-12 w-12 rounded-full bg-black/50 p-2 flex items-center justify-center shrink-0 border border-white/[0.05] group-hover:border-white/[0.1] transition-colors">
                          {coin ? (
                            <img src={coin.image} alt={coin.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="font-bold text-xs text-white">{holding.coinId.substring(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[17px] uppercase truncate text-white">{coin?.symbol || holding.coinId}</p>
                          <p className="text-[13px] text-zinc-500 truncate mt-0.5">
                            {formatCryptoAmount(holding.amount)} · {formatSelectedCompactAmount(currentPriceUsd)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-[17px] text-white flex items-center justify-end gap-1">
                          {renderSelectedAmount(displayValue, 14)}
                        </p>
                        <p className={cn("text-[13px] font-semibold flex items-center justify-end gap-1 mt-0.5", profitUsd >= 0 ? "text-[#06b6d4]" : "text-rose-400")}>
                          {profitUsd >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {formatSelectedCompactAmount(Math.abs(displayProfit))}
                          <span className="opacity-80 ml-0.5">({Math.abs(profitPercent).toFixed(2)}%)</span>
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="font-bold text-xl px-1">Market</h2>

          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search coins..."
              className="w-full bg-white/[0.03] border border-white/[0.05] rounded-full py-4 pl-14 pr-6 text-white placeholder:text-zinc-500 focus:outline-none focus:bg-white/[0.05] transition-all backdrop-blur-sm text-[15px]"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              data-testid="input-demo-coin-search"
            />
          </form>

          {error ? (
            <div className="text-center py-6 text-rose-400 text-sm rounded-[24px] bg-rose-500/10 border border-rose-500/20">{error}</div>
          ) : null}

          <div className="space-y-2">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="text-white/50 font-bold text-sm animate-pulse tracking-widest">LOADING MARKET...</div>
              </div>
            ) : coins.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">No coins found</div>
            ) : (
              coins.map((coin) => {
                return (
                  <Link key={coin.id} href={`/demo-trading/${coin.id}`}>
                    <div className="flex justify-between items-center p-4 rounded-[20px] hover:bg-white/[0.03] transition-colors cursor-pointer group" data-testid={`card-market-coin-${coin.id}`}>
                      <div className="flex gap-4 items-center min-w-0">
                        <div className="h-11 w-11 rounded-full bg-white/[0.02] p-1 border border-white/[0.05] shrink-0">
                           <img src={coin.image} alt={coin.name} className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[16px] text-white truncate">{coin.name}</div>
                          <div className="text-[12px] uppercase text-zinc-500 mt-0.5">{coin.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-[16px] text-white">
                          {formatSelectedPrice(coin.current_price)}
                        </div>
                        <div className={cn("text-[13px] font-semibold flex items-center justify-end gap-1 mt-0.5", coin.price_change_percentage_24h >= 0 ? "text-[#06b6d4]" : "text-rose-400")}>
                          {coin.price_change_percentage_24h >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {transactions.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-bold text-xl px-1">Recent Activity</h2>
            <div className="space-y-3">
              {transactions.slice(0, 8).map((transaction) => {
                const convertedTotal = convert(transaction.totalValue);
                const convertedPrice = convert(transaction.priceAtTransaction);

                return (
                  <div key={transaction.id} className="flex items-center justify-between p-4 rounded-[20px] bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm" data-testid={`row-demo-transaction-${transaction.id}`}>
                    <div className="flex items-center gap-4">
                      <div className={cn("h-11 w-11 rounded-full flex items-center justify-center font-bold text-xl", transaction.type === "buy" ? "bg-[#06b6d4]/10 text-[#06b6d4]" : "bg-rose-500/10 text-rose-400")}>
                        {transaction.type === "buy" ? "+" : "-"}
                      </div>
                      <div>
                        <p className="font-bold text-[16px] text-white">
                          {transaction.type === "buy" ? "Bought" : "Sold"} {transaction.coinSymbol.toUpperCase()}
                        </p>
                        <p className="text-[12px] text-zinc-500 mt-0.5">{format(new Date(transaction.date), "MMM d, HH:mm")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[16px] text-white flex items-center justify-end gap-1">
                        {renderSelectedAmount(convertedTotal, 14)}
                      </p>
                      <p className="text-[12px] text-zinc-500 flex items-center justify-end gap-1 mt-0.5">
                        <span>{formatCryptoAmount(transaction.amount)} @</span>
                        <span>{formatSelectedCompactAmount(convertedPrice)}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
