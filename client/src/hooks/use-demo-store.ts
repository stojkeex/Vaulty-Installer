import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Transaction {
  id: string;
  type: "buy" | "sell";
  coinId: string;
  coinSymbol: string;
  amount: number;
  priceAtTransaction: number;
  totalValue: number;
  date: string;
}

export interface Holding {
  coinId: string;
  amount: number;
  averageBuyPrice: number;
}

interface DemoStore {
  version: number;
  balance: number;
  holdings: Holding[];
  transactions: Transaction[];
}

export const INITIAL_DEMO_BALANCE = 1000000;

const STORE_VERSION = 3;

const createInitialStore = (): DemoStore => ({
  version: STORE_VERSION,
  balance: INITIAL_DEMO_BALANCE,
  holdings: [],
  transactions: [],
});

const sanitizeNumber = (value: unknown, fallback: number = 0) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const sanitizeStore = (value: unknown): DemoStore => {
  const input = typeof value === "object" && value !== null ? (value as Partial<DemoStore>) : {};

  return {
    version: STORE_VERSION,
    balance: Math.max(0, sanitizeNumber(input.balance, INITIAL_DEMO_BALANCE)),
    holdings: Array.isArray(input.holdings)
      ? input.holdings
          .map((holding) => ({
            coinId: String(holding.coinId ?? ""),
            amount: Math.max(0, sanitizeNumber(holding.amount)),
            averageBuyPrice: Math.max(0, sanitizeNumber(holding.averageBuyPrice)),
          }))
          .filter((holding) => holding.coinId && holding.amount > 0)
      : [],
    transactions: Array.isArray(input.transactions)
      ? input.transactions
          .map((transaction) => {
            const type: Transaction["type"] = transaction.type === "sell" ? "sell" : "buy";

            return {
              id: String(transaction.id ?? crypto.randomUUID()),
              type,
              coinId: String(transaction.coinId ?? ""),
              coinSymbol: String(transaction.coinSymbol ?? ""),
              amount: Math.max(0, sanitizeNumber(transaction.amount)),
              priceAtTransaction: Math.max(0, sanitizeNumber(transaction.priceAtTransaction)),
              totalValue: Math.max(0, sanitizeNumber(transaction.totalValue)),
              date: String(transaction.date ?? new Date().toISOString()),
            };
          })
          .filter((transaction) => transaction.coinId && transaction.amount > 0)
      : [],
  };
};

const getLocalKeys = (uid: string) => [
  `vaulty_demo_store_${uid}_v3`,
  `vaulty_demo_store_${uid}_v2`,
  `vaulty_demo_store_${uid}`,
];

const readLocalStore = (uid: string) => {
  for (const key of getLocalKeys(uid)) {
    const value = localStorage.getItem(key);

    if (!value) {
      continue;
    }

    try {
      return sanitizeStore(JSON.parse(value));
    } catch (error) {
      console.error("Error parsing local demo data", error);
    }
  }

  return null;
};

export function useDemoStore() {
  const { user } = useAuth();
  const [store, setStore] = useState<DemoStore>(createInitialStore());
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (!user) {
      setStore(createInitialStore());
      setIsHydrated(false);
      return;
    }

    let isCancelled = false;

    const loadData = async () => {
      setIsHydrated(false);

      const localStore = readLocalStore(user.uid);

      if (localStore && !isCancelled) {
        setStore(localStore);
      }

      try {
        const nextDocRef = doc(db, "users", user.uid, "features", "demo_trading_v3");
        const legacyDocRef = doc(db, "users", user.uid, "features", "demo_trading_v2");

        const [nextSnapshot, legacySnapshot] = await Promise.all([getDoc(nextDocRef), getDoc(legacyDocRef)]);

        const remoteStore = nextSnapshot.exists()
          ? sanitizeStore(nextSnapshot.data())
          : legacySnapshot.exists()
            ? sanitizeStore(legacySnapshot.data())
            : localStore ?? createInitialStore();

        if (!isCancelled) {
          setStore(remoteStore);
        }

        localStorage.setItem(`vaulty_demo_store_${user.uid}_v3`, JSON.stringify(remoteStore));
        await setDoc(nextDocRef, remoteStore);
      } catch (error) {
        console.error("Error loading demo trading data:", error);
      } finally {
        if (!isCancelled) {
          setIsHydrated(true);
        }
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user || !isHydrated) {
      return;
    }

    localStorage.setItem(`vaulty_demo_store_${user.uid}_v3`, JSON.stringify(store));

    const timeoutId = setTimeout(async () => {
      try {
        const docRef = doc(db, "users", user.uid, "features", "demo_trading_v3");
        await setDoc(docRef, store);
      } catch (error) {
        console.error("Error saving demo trading data:", error);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [store, user, isHydrated]);

  const buyCoin = (coinId: string, coinSymbol: string, amount: number, price: number) => {
    const safeAmount = sanitizeNumber(amount);
    const safePrice = sanitizeNumber(price);
    const totalCost = safeAmount * safePrice;

    if (safeAmount <= 0 || safePrice <= 0) {
      throw new Error("Invalid order amount");
    }

    if (totalCost > store.balance) {
      throw new Error("Insufficient demo funds");
    }

    setStore((prev) => {
      const existingHolding = prev.holdings.find((holding) => holding.coinId === coinId);
      let nextHoldings = [...prev.holdings];

      if (existingHolding) {
        const totalValue = existingHolding.amount * existingHolding.averageBuyPrice + totalCost;
        const totalAmount = existingHolding.amount + safeAmount;
        const averageBuyPrice = totalValue / totalAmount;

        nextHoldings = nextHoldings.map((holding) =>
          holding.coinId === coinId
            ? { ...holding, amount: totalAmount, averageBuyPrice }
            : holding,
        );
      } else {
        nextHoldings.push({
          coinId,
          amount: safeAmount,
          averageBuyPrice: safePrice,
        });
      }

      const transaction: Transaction = {
        id: crypto.randomUUID(),
        type: "buy",
        coinId,
        coinSymbol,
        amount: safeAmount,
        priceAtTransaction: safePrice,
        totalValue: totalCost,
        date: new Date().toISOString(),
      };

      return {
        version: STORE_VERSION,
        balance: prev.balance - totalCost,
        holdings: nextHoldings,
        transactions: [transaction, ...prev.transactions],
      };
    });
  };

  const sellCoin = (coinId: string, coinSymbol: string, amount: number, price: number) => {
    const safeAmount = sanitizeNumber(amount);
    const safePrice = sanitizeNumber(price);
    const holding = store.holdings.find((item) => item.coinId === coinId);

    if (safeAmount <= 0 || safePrice <= 0) {
      throw new Error("Invalid order amount");
    }

    if (!holding || holding.amount < safeAmount) {
      throw new Error("Insufficient holdings");
    }

    setStore((prev) => {
      const totalValue = safeAmount * safePrice;
      const nextHoldings = prev.holdings
        .map((item) =>
          item.coinId === coinId
            ? { ...item, amount: item.amount - safeAmount }
            : item,
        )
        .filter((item) => item.amount > 0.00000001);

      const transaction: Transaction = {
        id: crypto.randomUUID(),
        type: "sell",
        coinId,
        coinSymbol,
        amount: safeAmount,
        priceAtTransaction: safePrice,
        totalValue,
        date: new Date().toISOString(),
      };

      return {
        version: STORE_VERSION,
        balance: prev.balance + totalValue,
        holdings: nextHoldings,
        transactions: [transaction, ...prev.transactions],
      };
    });
  };

  const addFunds = (amount: number) => {
    const safeAmount = sanitizeNumber(amount);

    if (safeAmount <= 0) {
      throw new Error("Invalid funds amount");
    }

    setStore((prev) => ({
      ...prev,
      version: STORE_VERSION,
      balance: prev.balance + safeAmount,
    }));
  };

  const resetAccount = () => {
    setStore(createInitialStore());
  };

  return {
    balance: store.balance,
    holdings: store.holdings,
    transactions: store.transactions,
    isHydrated,
    buyCoin,
    sellCoin,
    addFunds,
    resetAccount,
  };
}
