import { useState, useEffect } from "react";

export const useUniversities = () => {
  const [universities, setUniversities] = useState([]);

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json"
    )
      .then((res) => res.json())
      .then((data) => setUniversities(data))
      .catch((err) => console.error("Error fetching universities:", err));
  }, []);

  return universities;
};
