import { useState } from "react";

/**
 * Custom hook for managing the active page state in the dashboard
 * @param initialPage - The initial active page (defaults to "home")
 * @returns Object containing the current active page and setter function
 */
export const useActivePage = (initialPage = "home") => {
  const [activePage, setActivePage] = useState<string>(initialPage);

  return { activePage, setActivePage };
};
