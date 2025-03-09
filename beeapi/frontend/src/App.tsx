import { useState } from "react";
import AppSidebar from "./components/Sidebar/Sidebar";
import HomePage from "./pages/Home/Home";
import useFetch from "./hooks/useFetch";
import { ServerName } from "./types/ServerName";
import ThemePage from "./pages/Theme/Theme";

function App() {
  const { data } = useFetch<ServerName>("/name");
  const [selectedMenu, setSelectedMenu] = useState("Home");

  const renderContent = () => {
    switch (true) {
      case "Home" === selectedMenu:
        return <HomePage setSelectedMenu={setSelectedMenu} />;
      case selectedMenu.startsWith("Theme"):
        return <ThemePage selectedMenu={selectedMenu} />;
      case "Puzzles" === selectedMenu:
        return <p className="text-center">Get puzzle input</p>;
      case "Team" === selectedMenu:
        return <p className="text-center">Manage users</p>;
      case "Forge" === selectedMenu:
        return (
          <p className="text-center">Compile and Extract .alghive files</p>
        );
      case "Settings" === selectedMenu:
        return <p className="text-center">Access Settings</p>;
    }
  };

  return (
    <div className="app-container">
      <AppSidebar
        selectedMenu={selectedMenu}
        setSelectedMenu={setSelectedMenu}
      />

      <div className="content-container">
        <h1 className="text-3xl font-bold text-center">{`BeeAPI - Interface - ${data?.name}`}</h1>
        <div className="flex mt-2">
          <div className="">
            <div className="mt-6">{renderContent()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
