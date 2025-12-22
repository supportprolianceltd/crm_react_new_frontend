// src/hooks/useCities.js (or adjust path as needed)

import { useState, useEffect } from "react";
import axios from "axios";

const useCities = () => {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const { data } = await axios.get(
          "https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/cities.json"
        );
        setCities(data);
      } catch (err) {
        console.error("Error fetching cities:", err);
      }
    };

    fetchCities();
  }, []);

  return cities;
};

export default useCities;
