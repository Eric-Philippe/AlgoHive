import LayoutTopBar from "./components/ui/layouts/LayoutTopbar/LayoutTopBar";

import "./App.css";
import LayoutContent from "./components/ui/layouts/LayoutContent/LayoutContent";
import AppDock from "./components/ui/Dock/Dock";

function App() {
  return (
    <div className="layout-wrapper layout-dark">
      <LayoutTopBar />
      <LayoutContent>
        <AppDock />
      </LayoutContent>
    </div>
  );
}

export default App;
