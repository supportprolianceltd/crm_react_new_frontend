// src/hooks/useStates.js (or adjust path as needed)

import { useState, useEffect } from "react";
import axios from "axios";

const useStates = () => {
  const [states, setStates] = useState([]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const { data } = await axios.get(
          "https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/states.json"
        );
        setStates(data);
      } catch (err) {
        console.error("Error fetching states:", err);
      }
    };

    fetchStates();
  }, []);

  return states;
};

export default useStates;
