import React, { createContext, useContext, useState, ReactNode } from "react";

interface ActivePageContextType {
  activePage: string;
  setActivePage: (page: string) => void;
}

const ActivePageContext = createContext<ActivePageContextType | undefined>(
  undefined
);

export const ActivePageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [activePage, setActivePage] = useState<string>("home");

  return (
    <ActivePageContext.Provider value={{ activePage, setActivePage }}>
      {children}
    </ActivePageContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useActivePage = () => {
  const context = useContext(ActivePageContext);
  if (context === undefined) {
    throw new Error("useActivePage must be used within an ActivePageProvider");
  }
  return context;
};
