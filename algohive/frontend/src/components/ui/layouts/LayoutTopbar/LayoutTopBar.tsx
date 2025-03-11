import "./LayoutTopBar.css";
import { useState, useEffect } from "react";

function LayoutTopBar() {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Becomes sticky when the user scrolls past 50px
      setIsSticky(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup when component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`layout-topbar ${isSticky ? "layout-topbar-sticky" : ""}`}
    ></div>
  );
}

export default LayoutTopBar;
