import classNames from "classnames";

import "./Sidebar.css";

interface SidebarProps {
  selectedMenu: string;
  setSelectedMenu: (menu: string) => void;
}

export default function Sidebar({
  selectedMenu,
  setSelectedMenu,
}: SidebarProps) {
  const handleMenuClick = (menu: string) => {
    setSelectedMenu(menu);
  };

  const items = [
    {
      label: "Home",
      icon: "pi pi-home",
      command: () => handleMenuClick("Home"),
      className: classNames({ "active-menu-item": selectedMenu === "Home" }),
    },
    {
      label: "Themes",
      icon: "pi pi-folder",
      command: () => handleMenuClick("Themes"),
      className: classNames({ "active-menu-item": selectedMenu === "Themes" }),
    },
    {
      label: "Puzzles",
      icon: "pi pi-trophy",
      command: () => handleMenuClick("Puzzles"),
      className: classNames({ "active-menu-item": selectedMenu === "Puzzles" }),
    },
    {
      label: "Team",
      icon: "pi pi-users",
      command: () => handleMenuClick("Team"),
      className: classNames({ "active-menu-item": selectedMenu === "Team" }),
    },
    {
      label: "Forge",
      icon: "pi pi-wrench",
      command: () => handleMenuClick("Forge"),
      className: classNames({ "active-menu-item": selectedMenu === "Forge" }),
    },
    {
      label: "Settings",
      icon: "pi pi-cog",
      command: () => handleMenuClick("Settings"),
      className: classNames({
        "active-menu-item": selectedMenu === "Settings",
      }),
    },
  ];

  return (
    <nav className="w-56 p-sidebar-sm">
      <div className="p-3 flex flex-col">
        <div className="mb-8 mt-4 text-center">
          <i className="pi pi-box text-orange-500 sb-icon"></i>
        </div>
        <div className="w-full">
          <ul className="menu p-reset">
            {items.map((item) => (
              <li
                key={item.label}
                className={classNames(
                  "menuitem",
                  "p-component",
                  "menuitem-link",
                  "menuitem-active",
                  item.className
                )}
                onClick={item.command}
              >
                <a href="#" className="menuitem-link">
                  <span className="menuitem-icon">
                    <i className={item.icon + " sb-icon"}></i>
                  </span>
                  <span className="menuitem-text">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
