import { useState, useEffect } from "react";
import { Dock } from "primereact/dock";
import { Dialog } from "primereact/dialog";
import { Terminal } from "primereact/terminal";
import { TerminalService } from "primereact/terminalservice";

import "./Dock.css";
import { Tooltip } from "primereact/tooltip";
import { useTranslation } from "react-i18next";

export default function AppDock() {
  const { t } = useTranslation();
  const [displayTerminal, setDisplayTerminal] = useState(false);

  const dockItems = [
    {
      label: t("staff.menu.terminal"),
      icon: () => (
        <div
          style={{
            width: "65px",
            height: "65px",
            borderRadius: "50%",
            backgroundColor: "#262626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i className="pi pi-wrench" style={{ fontSize: "2rem" }}></i>
        </div>
      ),
      command: () => {
        setDisplayTerminal(true);
      },
    },
    {
      label: t("staff.menu.users"),
      icon: () => (
        <div
          style={{
            width: "65px",
            height: "65px",
            borderRadius: "50%",
            backgroundColor: "#262626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i className="pi pi-user" style={{ fontSize: "2rem" }}></i>
        </div>
      ),
      command: () => {},
    },
    {
      label: t("staff.menu.roles"),
      icon: () => (
        <div
          style={{
            width: "65px",
            height: "65px",
            borderRadius: "50%",
            backgroundColor: "#262626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i className="pi pi-id-card" style={{ fontSize: "2rem" }}></i>
        </div>
      ),
      command: () => {},
    },
    {
      label: t("staff.menu.scopes"),
      icon: () => (
        <div
          style={{
            width: "65px",
            height: "65px",
            borderRadius: "50%",
            backgroundColor: "#262626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i className="pi pi-building" style={{ fontSize: "2rem" }}></i>
        </div>
      ),
      command: () => {},
    },
    {
      label: t("staff.menu.groups"),
      icon: () => (
        <div
          style={{
            width: "65px",
            height: "65px",
            borderRadius: "50%",
            backgroundColor: "#262626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i className="pi pi-users" style={{ fontSize: "2rem" }}></i>
        </div>
      ),
      command: () => {},
    },
    {
      label: t("staff.menu.competitions"),
      icon: () => (
        <div
          style={{
            width: "65px",
            height: "65px",
            borderRadius: "50%",
            backgroundColor: "#262626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i className="pi pi-graduation-cap" style={{ fontSize: "2rem" }}></i>
        </div>
      ),
    },
    {
      label: t("staff.menu.apis"),
      icon: () => (
        <div
          title="Trash"
          style={{
            width: "65px",
            height: "65px",
            borderRadius: "50%",
            backgroundColor: "#262626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i className="pi pi-server" style={{ fontSize: "2rem" }}></i>
        </div>
      ),
      command: () => {},
    },
  ];

  const commandHandler = (text: string) => {
    let response;
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
  }, []);

  return (
    <div className="dock-window dock-advanced">
      <Tooltip
        className="dark-tooltip"
        target=".dock-advanced .p-dock-action"
        my="center bottom-5"
        at="center top"
        showDelay={150}
      />
      <Dock model={dockItems} />
      <Dialog
        visible={displayTerminal}
        breakpoints={{ "960px": "50vw", "600px": "75vw" }}
        style={{ width: "30vw" }}
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
