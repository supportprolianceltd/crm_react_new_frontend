import { createContext, useContext, useState } from 'react';

const MobileNavContext = createContext();

export const useMobileNav = () => useContext(MobileNavContext);

export const MobileNavProvider = ({ children }) => {
  const [mobileNavActive, setMobileNavActive] = useState(false);

  return (
    <MobileNavContext.Provider value={{ mobileNavActive, setMobileNavActive }}>
      {children}
    </MobileNavContext.Provider>
  );
};
