import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { VaultyIcon } from "@/components/ui/vaulty-icon";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "JPY" | "AUD" | "CAD" | "VC";

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  format: (amount: number) => ReactNode;
  symbol: string;
  convert: (amount: number, from?: CurrencyCode, to?: CurrencyCode) => number;
  rate: number;
}

const fallbackRates: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 150.25,
  AUD: 1.52,
  CAD: 1.35,
  VC: 1,
};

const currencySymbols: Record<CurrencyCode, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
  VC: "VC",
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "VC",
  setCurrency: () => {},
  format: (amount) => amount.toString(),
  symbol: "",
  convert: (amount) => amount,
  rate: 1,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem("vaulty_currency");
    return (saved as CurrencyCode) || "VC";
  });
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(fallbackRates);

  useEffect(() => {
    let mounted = true;

    const loadRates = async () => {
      try {
        const response = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await response.json();

        if (!mounted || data?.result !== "success" || !data?.rates) {
          return;
        }

        setRates((previousRates) => ({
          ...previousRates,
          USD: 1,
          EUR: data.rates.EUR ?? previousRates.EUR,
          GBP: data.rates.GBP ?? previousRates.GBP,
          JPY: data.rates.JPY ?? previousRates.JPY,
          AUD: data.rates.AUD ?? previousRates.AUD,
          CAD: data.rates.CAD ?? previousRates.CAD,
          VC: 1,
        }));
      } catch (error) {
        console.error("Failed to load live currency rates", error);
      }
    };

    loadRates();
    const intervalId = window.setInterval(loadRates, 30 * 60 * 1000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    localStorage.setItem("vaulty_currency", newCurrency);
  };

  const format = (amount: number): ReactNode => {
    if (currency === "VC") {
      return (
        <span className="inline-flex items-center gap-1">
          <VaultyIcon size={14} className="inline-block" />
          {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      );
    }

    return (
      <span>
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount)}
      </span>
    );
  };

  const convert = (amount: number, from: CurrencyCode = "USD", to: CurrencyCode = currency) => {
    if (from === to) return amount;

    const sourceRate = from === "VC" ? 1 : rates[from];
    const targetRate = to === "VC" ? 1 : rates[to];
    const amountInUsd = from === "USD" || from === "VC" ? amount : amount / sourceRate;

    return to === "USD" || to === "VC" ? amountInUsd : amountInUsd * targetRate;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        format,
        symbol: currencySymbols[currency],
        convert,
        rate: currency === "VC" ? 1 : rates[currency],
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
