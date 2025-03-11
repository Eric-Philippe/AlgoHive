import AppDock from "../../../components/ui/Dock/Dock";
import LayoutContent from "../../../components/ui/layouts/LayoutContent/LayoutContent";
import LayoutTopBar from "../../../components/ui/layouts/LayoutTopbar/LayoutTopBar";

import "./Home.css";

export default function HomePage() {
  return (
    <div className="layout-wrapper layout-dark">
      <LayoutTopBar />
      <LayoutContent>
        <AppDock />
      </LayoutContent>
    </div>
  );
}
