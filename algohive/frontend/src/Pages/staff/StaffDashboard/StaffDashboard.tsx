import AppDock from "../../../components/ui/Dock/Dock";
import LayoutContent from "../../../components/ui/layouts/LayoutContent/LayoutContent";
import LayoutTopBar from "../../../components/ui/layouts/LayoutTopbar/LayoutTopBar";
import { Suspense, useState } from "react";

import "./StaffDashboard.css";
import { getStaffMenuItems } from "../../../config/StaffMenuItem";
import { useTranslation } from "react-i18next";

export default function StaffDashboard() {
  const { t } = useTranslation();
  const [activePage, setActivePage] = useState("home");

  const StaffMenuItems = getStaffMenuItems(t);

  // Find the active component to render
  const ActiveComponent = StaffMenuItems.find(
    (menu) => menu.id === activePage
  )?.Component;

  return (
    <div className="layout-wrapper layout-dark">
      <LayoutTopBar />
      <LayoutContent>
        <div className="">
          <Suspense fallback={<div className="loading">Loading...</div>}>
            {ActiveComponent != null ? <ActiveComponent /> : <></>}
          </Suspense>
        </div>
      </LayoutContent>
      <AppDock setPage={setActivePage} />
    </div>
  );
}
