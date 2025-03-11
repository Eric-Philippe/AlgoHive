import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PrimeReactProvider } from "primereact/api";
import "./lib/i18n";
import "./index.css";
import "primeicons/primeicons.css";
// primereact/resources/themes/arya-orange/theme.css
import "primereact/resources/themes/lara-dark-amber/theme.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PrimeReactProvider value={{ ripple: true }}>
      <App />
    </PrimeReactProvider>
  </StrictMode>
);
