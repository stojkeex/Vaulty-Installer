                <div className="absolute inset-0 bg-gradient-to-r from-white/10/0 via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                <div className="flex items-center gap-3.5 relative z-10">
                  <div className="w-11 h-11 rounded-2xl bg-black/40 border border-white/10 p-2 shadow-[inset_0_2px_10px_rgba(255,255,255,0.1)] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <Users className="w-5 h-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight leading-tight">
                      Invite Friends{" "}
                      <span className="inline-block bg-white/10/10 text-white border border-emerald-500/30 text-[9px] align-text-bottom font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ml-1">
                        +50 VC
                      </span>
                    </h3>
                    <p className="text-[11px] font-medium text-white/80/50 mt-0.5">
                      Earn crypto together
                    </p>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors relative z-10">
                  <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Finance News Card */}
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl h-full">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_32%)] pointer-events-none" />
              <div className="relative z-10 h-full flex flex-col">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.26em] text-vaulty-gradient opacity-80">
                      Live finance news
                    </p>
                    <h3 className="mt-1 text-xl font-bold tracking-tight text-vaulty-gradient">
                      Market Pulse
                    </h3>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-inner">
                    Simulated
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentNewsIndex}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-2xl border border-white/5 bg-black/30 p-5 shadow-inner hover:bg-black/40 transition-colors cursor-pointer flex-1"
                  >
                    <div className="mb-3.5 flex items-center justify-between gap-3">
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                        {FINANCE_NEWS[currentNewsIndex].kicker}
                      </span>
                      <span className="text-[10px] text-white/40 font-medium">
                        Updates every 30s
                      </span>
                    </div>
                    <h4 className="text-[1.1rem] font-bold leading-snug text-white">
                      {FINANCE_NEWS[currentNewsIndex].title}
                    </h4>
                    <p className="mt-3 text-sm leading-relaxed text-white/60">
                      {FINANCE_NEWS[currentNewsIndex].summary}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Shortcut Menu Bottom Sheet */}
      <Sheet open={isWidgetMenuOpen} onOpenChange={setIsWidgetMenuOpen}>
        <SheetContent
          side="bottom"
          className="h-[85vh] bg-black border-t border-white/10 p-0 text-white rounded-t-[32px] sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl sm:mx-auto flex flex-col z-[100]"
        >
          <div className="p-6 pb-4 border-b border-white/10 shrink-0">
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Widgets</h2>
                <p className="text-sm text-white/60 mt-1">
                  Customize widgets ({activeWidgets.length}/6)
                </p>
              </div>
              <button
                onClick={() => setIsWidgetMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
            {AVAILABLE_WIDGETS.map((widget) => {
              const isActive = activeWidgets.includes(widget.id);
              const Icon = widget.icon;
              return (
                <div
                  key={widget.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] border border-white/10 backdrop-blur-xl mb-2"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center border",
                        isActive
                          ? "bg-white/10 border-white/20 text-white"
                          : "bg-black/40 border-white/5 text-white/40",
                      )}
                    >
                      <Icon size={22} />
                    </div>
                    <div>
                      <span
                        className={cn(
                          "font-bold text-lg",
                          isActive ? "text-white" : "text-white/60",
                        )}
                      >
                        {widget.title}
                      </span>
                      <p className="text-xs text-white/40 mt-0.5">
                        {widget.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (isActive && activeWidgets.length <= 2) {
                        toast({
                          title: "Cannot remove widget",
                          description: "Minimum 2 widgets required",
                          variant: "destructive",
                        });
                        return;
                      }
                      if (!isActive && activeWidgets.length >= 6) {
                        toast({
                          title: "Cannot add widget",
                          description: "Maximum 6 widgets allowed",
                          variant: "destructive",
                        });
                        return;
                      }
                      setActiveWidgets((prev) =>
                        isActive
                          ? prev.filter((id) => id !== widget.id)
                          : [...prev, widget.id],
                      );
                    }}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-bold transition-all w-[80px] text-center",
                      isActive
                        ? "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                        : "bg-white text-black hover:bg-gray-200",
                    )}
                  >
                    {isActive ? "Remove" : "Add"}
                  </button>
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
      {/* Action Menu Bottom Sheet */}
      <Sheet open={isActionMenuOpen} onOpenChange={setIsActionMenuOpen}>
        <SheetContent
          side="bottom"
          className="h-[80vh] bg-black border-t border-white/10 p-0 text-white rounded-t-[32px] sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl sm:mx-auto flex flex-col"
        >
          <div className="p-6 pb-4 border-b border-white/10 shrink-0">
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
            <h2 className="text-2xl font-bold">
              {actionType === "buy"
                ? "Buy Crypto"
                : actionType === "sell"
                  ? "Sell Crypto"
                  : "Send Crypto"}
            </h2>
            <p className="text-sm text-white/60 mt-1">
              {actionType === "buy"
                ? "Select a coin to purchase"
                : actionType === "sell"
                  ? "Select from your holdings to sell"
                  : "Select from your holdings to send"}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="space-y-2">
              {actionType === "buy" ? (
                // Show all loaded coins for Buy
                coins.length > 0 ? (
                  coins.map((coin) => (
                    <Link
                      key={`buy-${coin.id}`}
                      href={`/demo-trading/${coin.id}`}
                    >
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] border border-white/10 hover:bg-white/10 transition-colors cursor-pointer backdrop-blur-xl mb-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={coin.image}
                            alt={coin.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="font-bold text-white">{coin.name}</p>
                            <p className="text-xs text-white/40 uppercase">
                              {coin.symbol}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-white">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                            }).format(coin.current_price)}
                          </p>
                          <p
                            className={cn(
                              "text-xs font-semibold",
                              coin.price_change_percentage_24h >= 0
                                ? "text-white"
                                : "text-white",
                            )}
                          >
                            {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                            {coin.price_change_percentage_24h?.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-10 text-white/40 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin mb-4 opacity-50" />
                    <p>Loading market data...</p>
                  </div>
                )
              ) : // Show only holdings for Sell and Send
              holdings.length > 0 ? (
                holdings.map((holding) => {
                  const coin = coins.find((c) => c.id === holding.coinId);
                  if (!coin) return null;

                  const holdingValueUsd =
                    holding.amount * (coin.current_price || 0);
                  const displayValue = convert(holdingValueUsd);

                  return (
                    <Link
                      key={`hold-${coin.id}`}
                      href={`/demo-trading/${coin.id}`}
                    >
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] border border-white/10 hover:bg-white/10 transition-colors cursor-pointer backdrop-blur-xl mb-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={coin.image}
                            alt={coin.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="font-bold text-white">{coin.name}</p>
                            <p className="text-xs text-white/40 uppercase">
                              {coin.symbol}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white">
                            {currency === "VC" ? (
                              <VaultyIcon size={12} className="inline mr-1" />
                            ) : (
                              ""
                            )}
                            {currency === "VC"
                              ? displayValue.toLocaleString(undefined, {
                                  maximumFractionDigits: 2,
                                })
                              : new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency,
                                }).format(displayValue)}
                          </p>
                          <p className="text-xs text-white/60 font-medium">
                            {holding.amount} {coin.symbol.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="text-center py-10 text-white/40 flex flex-col items-center justify-center">
                  <Wallet className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>You don't have any holdings to {actionType}.</p>
                  <button
                    onClick={() => setActionType("buy")}
                    className="mt-6 px-6 py-3 bg-white text-black rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
                  >
                    Buy Crypto First
                  </button>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
