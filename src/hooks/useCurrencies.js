// src/hooks/useCurrencies.js (or adjust path as needed)

import { useState, useEffect } from "react";
import axios from "axios";

const useCurrencies = () => {
  const [currencies, setCurrencies] = useState([]);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const { data } = await axios.get(
          "https://restcountries.com/v3.1/all?fields=currencies"
        );
        const allCurrencies = new Map();
        data.forEach((country) => {
          if (country.currencies) {
            Object.entries(country.currencies).forEach(([code, info]) => {
              if (!allCurrencies.has(code)) {
                allCurrencies.set(code, {
                  code,
                  name: info.name,
                  symbol: info.symbol || "",
                });
              }
            });
          }
        });
        const currencyList = Array.from(allCurrencies.values()).sort((a, b) =>
          a.code.localeCompare(b.code)
        );
        setCurrencies(currencyList);
      } catch (err) {
        console.error("Error fetching currencies:", err);
      }
    };

    fetchCurrencies();
  }, []);

  return currencies;
};

export default useCurrencies;
