import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { RefreshCcw, Search, Wallet, PieChart, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
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
        <div className="relative overflow-hidden rounded-[2rem] p-6 bg-gradient-to-br from-[#2a1b3d] to-[#120d1a] border border-white/5 shadow-2xl">
          <div className="absolute -right-6 -top-4 opacity-10">
            <VaultyIcon size={160} />
          </div>

          <div className="relative z-10 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Demo Balance</p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                  {isVaultyCredits ? "Vaulty Credits" : currency === "EUR" ? "Euro" : "Dollar"}
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-black/20 p-1">
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
                <div className="text-4xl font-bold text-white tracking-tight flex items-center gap-2">
                  {renderSelectedAmount(totalBalance, 34)}
                </div>
                {isVaultyCredits && (
                  <div className="mt-2 pl-11 text-sm font-semibold text-zinc-400">
                    {formatUsd(totalBalanceUsd)}
                  </div>
                )}
              </div>
              <div className={cn("mt-2 text-sm font-semibold flex items-center gap-1", totalProfitUsd >= 0 ? "text-green-400" : "text-red-400")} data-testid="text-demo-profit-summary">
                {totalProfitUsd >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {renderSelectedAmount(Math.abs(totalProfit), 10)}
                <span>({Math.abs(totalProfitPercent).toFixed(2)}%)</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/5 border border-white/5 p-3">
                <div className="text-[11px] uppercase tracking-wide text-zinc-500 flex items-center gap-1">
                  <Wallet className="w-3 h-3" /> Cash
                </div>
                <div className="mt-2 text-sm font-bold flex items-center gap-1" data-testid="text-demo-cash-balance">
                  {renderSelectedCompactAmount(cashBalance, 12)}
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/5 p-3">
                <div className="text-[11px] uppercase tracking-wide text-zinc-500 flex items-center gap-1">
                  <PieChart className="w-3 h-3" /> Holdings
                </div>
                <div className="mt-2 text-sm font-bold flex items-center gap-1" data-testid="text-demo-invested-balance">
                  {renderSelectedCompactAmount(investedBalance, 12)}
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/5 p-3">
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
            <div className="text-center py-10 rounded-[2rem] bg-[#111] border border-white/5 text-gray-500">Loading portfolio...</div>
          ) : enrichedHoldings.length === 0 ? (
            <div className="text-center py-10 rounded-[2rem] bg-[#111] border border-white/5">
              <p className="text-gray-500 text-sm">No active holdings yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {enrichedHoldings.map(({ holding, coin, currentValueUsd, profitUsd, profitPercent, currentPriceUsd }) => {
                const displayValue = convert(currentValueUsd);
                const displayProfit = convert(profitUsd);

                return (
                  <Link key={holding.coinId} href={`/demo-trading/${holding.coinId}`}>
                    <div className="flex items-center justify-between p-5 rounded-[2rem] bg-[#111] border border-white/5 active:scale-[0.98] transition-transform cursor-pointer" data-testid={`card-demo-holding-${holding.coinId}`}>
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-12 w-12 rounded-full bg-white/5 p-2 flex items-center justify-center shrink-0">
                          {coin ? (
                            <img src={coin.image} alt={coin.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="font-bold text-xs">{holding.coinId.substring(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-lg uppercase truncate">{coin?.symbol || holding.coinId}</p>
                          <p className="text-sm text-gray-500 truncate">
                            {formatCryptoAmount(holding.amount)} · {formatSelectedCompactAmount(currentPriceUsd)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-lg flex items-center justify-end gap-1">
                          {renderSelectedAmount(displayValue, 14)}
                        </p>
                        <p className={cn("text-sm font-medium flex items-center justify-end gap-1", profitUsd >= 0 ? "text-green-500" : "text-red-400")}>
                          {profitUsd >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {formatSelectedCompactAmount(Math.abs(displayProfit))}
                          <span>({Math.abs(profitPercent).toFixed(2)}%)</span>
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
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search coins..."
              className="w-full bg-[#111] border border-white/5 rounded-full py-4 pl-12 pr-6 text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              data-testid="input-demo-coin-search"
            />
          </form>

          {error ? (
            <div className="text-center py-8 text-red-400 text-sm rounded-[2rem] bg-[#111] border border-red-500/20">{error}</div>
          ) : null}

          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="text-purple-500 font-bold text-sm animate-pulse">LOADING MARKET...</div>
              </div>
            ) : coins.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No coins found</div>
            ) : (
              coins.map((coin) => {
                return (
                  <Link key={coin.id} href={`/demo-trading/${coin.id}`}>
                    <div className="flex justify-between items-center p-4 rounded-[2rem] bg-black hover:bg-[#111] transition-colors cursor-pointer group" data-testid={`card-market-coin-${coin.id}`}>
                      <div className="flex gap-4 items-center min-w-0">
                        <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full object-cover" />
                        <div className="min-w-0">
                          <div className="font-bold text-base truncate">{coin.name}</div>
                          <div className="text-xs uppercase text-zinc-500">{coin.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-base">
                          {formatSelectedPrice(coin.current_price)}
                        </div>
                        <div className={cn("text-xs flex items-center justify-end gap-1", coin.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400")}>
                          {coin.price_change_percentage_24h >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
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
                  <div key={transaction.id} className="flex items-center justify-between p-4 rounded-[2rem] bg-[#111] border border-white/5" data-testid={`row-demo-transaction-${transaction.id}`}>
                    <div className="flex items-center gap-4">
                      <div className={cn("h-10 w-10 flex items-center justify-center font-bold text-2xl", transaction.type === "buy" ? "text-green-500" : "text-red-500")}>
                        {transaction.type === "buy" ? "+" : "-"}
                      </div>
                      <div>
                        <p className="font-bold text-base text-white">
                          {transaction.type === "buy" ? "Bought" : "Sold"} {transaction.coinSymbol.toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500">{format(new Date(transaction.date), "MMM d, HH:mm")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-base text-white flex items-center justify-end gap-1">
                        {renderSelectedAmount(convertedTotal, 14)}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center justify-end gap-1">
                        <span>{transaction.amount.toFixed(6)} @</span>
                        <span>{formatSelectedAmount(convertedPrice)}</span>
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
