import { useState, useEffect } from "react";
import axios from "axios";

const useCountries = () => {
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const { data } = await axios.get(
          "https://countriesnow.space/api/v0.1/countries/states"
        );
        setCountries(data?.data);
      } catch (err) {
        console.error("Error fetching countries:", err);
      }
    };

    fetchCountries();
  }, []);

  return countries;
};

export default useCountries;
