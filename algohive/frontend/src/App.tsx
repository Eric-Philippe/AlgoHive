import { Route, Routes } from "react-router-dom";
import HomePage from "./Pages/staff/Home/Home";
import LoginPage from "./Pages/misc/Login/Login";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
};

export default App;
