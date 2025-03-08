import { useEffect } from "react";
import "./App.css";

const fetchThemes = async () => {
  const response = await fetch("/themes");
  console.log(response);

  const data = await response.json();
  console.log(data);
};

function App() {
  useEffect(() => {
    fetchThemes();
  });

  return <></>;
}

export default App;
