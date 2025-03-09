import { useState } from "react";
import AppSidebar from "./components/Sidebar/Sidebar";
import Home from "./pages/Home";
import useFetch from "./hooks/useFetch";
import { ServerName } from "./types/ServerName";

function App() {
  const { data } = useFetch<ServerName>("/name");
  const [selectedMenu, setSelectedMenu] = useState("Home");

  const renderContent = () => {
    switch (selectedMenu) {
      case "Home":
        return <Home />;
      case "Themes":
        return <p className="text-center">About Us</p>;
      case "Puzzles":
        return <p className="text-center">Get puzzle input</p>;
      case "Team":
        return <p className="text-center">Manage users</p>;
      case "Forge":
        return <p className="text-center">Use the Forge</p>;
      case "Settings":
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
        <div className="flex justify-center mt-8">
          <div className="">
            <h2 className="text-2xl text-center">{selectedMenu}</h2>
            <div className="mt-12">{renderContent()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
