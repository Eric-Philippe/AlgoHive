import { useState, useEffect } from "react";
import { Dock } from "primereact/dock";
import { Dialog } from "primereact/dialog";
import { Terminal } from "primereact/terminal";
import { TerminalService } from "primereact/terminalservice";

import "./Dock.css";
import { Tooltip } from "primereact/tooltip";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../contexts/AuthContext";
import { getStaffMenuItems } from "../../../config/StaffMenuItem";

interface AppDockProps {
  setPage: (page: string) => void;
}

export default function AppDock({ setPage }: AppDockProps) {
  const { user } = useAuth();
  const { i18n, t } = useTranslation();
  const { logout } = useAuth();
  const [displayTerminal, setDisplayTerminal] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const StaffMenuItems = getStaffMenuItems(t);

  // Calculate sizes based on screen width
  const iconSize = windowWidth < 768 ? 45 : windowWidth < 1024 ? 55 : 65;
  const fontSize =
    windowWidth < 768 ? "1.5rem" : windowWidth < 1024 ? "1.75rem" : "2rem";

  // Listen for window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Function to create icon containers with responsive sizes
  const createIconContainer = (iconClass: string, iconColor: string) => (
    <div
      style={{
        width: `${iconSize}px`,
        height: `${iconSize}px`,
        borderRadius: "50%",
        backgroundColor: iconColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <i className={iconClass} style={{ fontSize: fontSize }}></i>
    </div>
  );

  const dockItems = [
    {
      label: t("navigation.staff.terminal"),
      icon: () => createIconContainer("pi pi-angle-right", "#262626"),
      command: () => {
        setDisplayTerminal(true);
      },
    },
  ];

  // StaffMenuItems.forEach((item) => {
  //   dockItems.push({
  //     label: item.label,
  //     icon: () => createIconContainer(item.icon, item.color),
  //     command: () => setPage(item.id),
  //   });
  // });

  for (const item of StaffMenuItems) {
    if (item.showInMenu && user && !item.showInMenu(user)) continue;
    dockItems.push({
      label: item.label,
      icon: () => createIconContainer(item.icon, item.color),
      command: () => setPage(item.id),
    });
  }

  const commandHandler = (text: string) => {
    let response;
    const lang = i18n.language === "en" ? "fr" : "en";
    const argsIndex = text.indexOf(" ");
    const command = argsIndex !== -1 ? text.substring(0, argsIndex) : text;

    switch (command) {
      case "date":
        response = "Today is " + new Date().toDateString();
        break;

      case "greet":
        response = "Hola " + text.substring(argsIndex + 1) + "!";
        break;

      case "random":
        response = Math.floor(Math.random() * 100);
        break;

      case "clear":
        response = null;
        break;

      case "logout":
        logout();
        break;

      case "lang":
        i18n.changeLanguage(lang);
        response = "Language switched to " + lang;
        break;
      default:
        response = "Unknown command: " + command;
        break;
    }

    if (response) {
      TerminalService.emit("response", response);
    } else {
      TerminalService.emit("clear");
    }
  };

  useEffect(() => {
    TerminalService.on("command", commandHandler);

    return () => {
      TerminalService.off("command", commandHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="dock-window dock-advanced app-dock">
      <Tooltip
        className="dark-tooltip"
        target=".dock-advanced .p-dock-action"
        my="center bottom-5"
        at="center top"
        showDelay={150}
      />
      <Dock
        model={dockItems}
        position={windowWidth < 768 ? "bottom" : "bottom"}
        className={windowWidth < 768 ? "p-dock-mobile" : ""}
      />
      <Dialog
        visible={displayTerminal}
        breakpoints={{ "960px": "75vw", "600px": "90vw" }}
        style={{ width: windowWidth < 768 ? "120vw" : "30vw" }}
        onHide={() => setDisplayTerminal(false)}
        maximizable
        blockScroll={false}
      >
        <Terminal
          welcomeMessage="Welcome to AlgoHive Terminal"
          prompt="admin@algohive $"
        />
      </Dialog>
    </div>
  );
}
