import { createContext, useContext, useState, useEffect } from "react";

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  // 🪣 Load saved currency from localStorage (or default to PHP)
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem("currency") || "PHP";
  });

  // 💱 Match symbol with selected currency
  const [symbol, setSymbol] = useState(() => {
    const saved = localStorage.getItem("symbol");
    return saved || "₱";
  });

  // ⚙️ Function to change currency
  const changeCurrency = (newCurrency) => {
    let newSymbol = "₱";

    switch (newCurrency) {
      case "USD":
        newSymbol = "$";
        break;
      case "EUR":
        newSymbol = "€";
        break;
      case "GBP":
        newSymbol = "£";
        break;
      default:
        newSymbol = "₱";
    }

    setCurrency(newCurrency);
    setSymbol(newSymbol);

    // 🧠 Save to localStorage so it persists
    localStorage.setItem("currency", newCurrency);
    localStorage.setItem("symbol", newSymbol);
  };

  return (
    <CurrencyContext.Provider value={{ currency, symbol, changeCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
