import { useState, useEffect } from "react";

export const useHighestQualifications = () => {
  const [qualifications, setQualifications] = useState([]);

  useEffect(() => {
    fetch(
      "https://gist.githubusercontent.com/cblanquera/21c925d1312e9a4de3c269be134f3a6c/raw/degrees.json"
    )
      .then((res) => res.json())
      .then((data) => {
        const qualList = data.map((d) => d.degree_title);
        setQualifications(qualList);
      })
      .catch((err) => console.error("Error fetching qualifications:", err));
  }, []);

  return qualifications;
};
