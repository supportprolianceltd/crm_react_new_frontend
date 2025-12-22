// src/context/SelectedFeaturesContext.js
import { createContext, useContext, useState } from 'react';

const SelectedFeaturesContext = createContext();

export const SelectedFeaturesProvider = ({ children }) => {
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  const toggleFeature = (name) => {
    setSelectedFeatures((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const removeFeature = (name) => {
    setSelectedFeatures((prev) => prev.filter((n) => n !== name));
  };

  return (
    <SelectedFeaturesContext.Provider value={{ selectedFeatures, toggleFeature, removeFeature }}>
      {children}
    </SelectedFeaturesContext.Provider>
  );
};

export const useSelectedFeatures = () => useContext(SelectedFeaturesContext);