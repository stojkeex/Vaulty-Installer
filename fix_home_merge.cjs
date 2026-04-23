const fs = require('fs');

let content = fs.readFileSync('client/src/pages/home.tsx', 'utf8');

const startPattern = '{/* TOP ROW: Merged Financial Health and Freedom Map */}';
const endPattern = '{/* MAIN GRID: Left Content and Right Sidebar */}';

const startIndex = content.indexOf(startPattern);
const endIndex = content.indexOf(endPattern);

if (startIndex !== -1 && endIndex !== -1) {
  const newSection = `{/* TOP ROW: Merged Financial Health and Freedom Map */}
        <div className="mb-8">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xl font-bold tracking-tight text-vaulty-gradient">
                Financial Health
              </h2>
            </div>
            
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-7 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl flex flex-col">
              
              {/* Net Worth & Budget */}
              <div className="flex justify-between items-start relative z-10 shrink-0">
                <div>
                  <p className="text-[12px] font-medium tracking-wide text-zinc-400 mb-1">
                    Net Worth
                  </p>
                  <h3 className="text-[2.5rem] leading-none font-bold tracking-tight text-white mb-3">
                    {currency === "VC" ? (
                      <VaultyIcon size={28} className="inline mr-2 -mt-1" />
                    ) : (
                      ""
                    )}
                    {currency === "VC"
                      ? totalBalanceDisplay.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })
                      : new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency,
                        }).format(totalBalanceDisplay)}
                  </h3>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.05] text-[13px] font-semibold",
                        isPositiveProfit ? "text-white" : "text-white",
                      )}
                    >
                      {isPositiveProfit ? (
                        <TrendingUp size={14} />
                      ) : (
                        <TrendingDown size={14} />
                      )}
                      <span>
                        {isPositiveProfit ? "+" : ""}
                        {totalProfitPercent.toFixed(2)}%
                      </span>
                      <span className="text-zinc-500 font-medium ml-1">
                        This month
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[13px] font-semibold text-white">
                      <Check size={14} />
                      <span>On track</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-[120px] w-full mt-6 -mx-2 relative z-0 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={OVERVIEW_CHART_DATA}>
                    <defs>
                      <linearGradient
                        id="overviewChartColor"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#06b6d4"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#06b6d4"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#06b6d4"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#overviewChartColor)"
                      isAnimationActive={true}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Zero-Based Budgeting Preview */}
              <div className="relative z-10 mt-auto pt-6 border-t border-white/10 shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-white">
                    Monthly Budget
                  </h4>
                  <span className="text-xs font-medium text-white/60">
                    0€ left to assign
                  </span>
                </div>
                <div className="w-full bg-black/60 rounded-full h-2 mb-4 overflow-hidden border border-white/5 relative flex">
                  <div
                    className="bg-white h-full w-[45%]"
                    title="Needs (45%)"
                  ></div>
                  <div
                    className="bg-white h-full w-[30%]"
                    title="Wants (30%)"
                  ></div>
                  <div
                    className="bg-white h-full w-[25%]"
                    title="Savings & Investing (25%)"
                  ></div>
                </div>
                <div className="flex justify-between items-center text-xs font-medium">
                  <div className="flex items-center gap-1.5 text-white/60">
                    <div className="w-2 h-2 rounded-full bg-white"></div>Needs
                  </div>
                  <div className="flex items-center gap-1.5 text-white/60">
                    <div className="w-2 h-2 rounded-full bg-white"></div>Wants
                  </div>
                  <div className="flex items-center gap-1.5 text-white/60">
                    <div className="w-2 h-2 rounded-full bg-white"></div>Future
                  </div>
                </div>
              </div>
              
              {/* Freedom Map Tasks appended directly below Budget */}
              <div className="relative z-10 mt-8 pt-6 border-t border-white/10 shrink-0 cursor-pointer group" onClick={() => setLocation('/freedom-map')}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-white">
                    Current Goal: <span className="text-[#00CCFF]">Emergency Fund</span>
                  </h4>
                  <ChevronRight className="text-white/40 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="space-y-0 flex flex-col">
                  <div className="flex items-center gap-4 opacity-50 shrink-0 pb-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0">
                      <Check size={14} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-bold text-white line-through">
                        Clear Bad Debt
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 relative shrink-0">
                    <div className="absolute left-[11px] -top-[12px] w-[2px] h-[12px] bg-white/20"></div>
                    <div className="w-6 h-6 rounded-full border-2 border-white/10 bg-black text-white flex items-center justify-center shrink-0 relative z-10 shadow-[0_0_10px_rgba(0,0,0,0.3)]">
                      <div className="w-1.5 h-1.5 bg-vaulty-gradient rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl p-3">
                      <div className="flex justify-between items-center mb-1.5">
                        <p className="text-[13px] font-bold text-white">
                          Save 3 Months Expenses
                        </p>
                        <span className="text-[11px] font-bold text-[#00CCFF]">
                          45%
                        </span>
                      </div>
                      <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-vaulty-gradient h-full w-[45%] shadow-[0_0_10px_rgba(0,204,255,0.5)]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        `;
        
  content = content.substring(0, startIndex) + newSection + content.substring(endIndex);
  fs.writeFileSync('client/src/pages/home.tsx', content);
  console.log("Successfully merged to a single card without extra spaces.");
} else {
  console.log("Could not find the markers.");
}
