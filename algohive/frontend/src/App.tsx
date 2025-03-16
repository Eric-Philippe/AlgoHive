import { Route, Routes } from "react-router-dom";
import LoginPage from "./Pages/misc/Login/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import RedirectIfAuthenticated from "./components/RedirectIfAuthenticated";
import StaffDashboard from "./Pages/staff/StaffDashboard/StaffDashboard";
import { ActivePageProvider } from "./contexts/ActivePageContext";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute target="staff">
              <ActivePageProvider>
                <StaffDashboard />
              </ActivePageProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectIfAuthenticated>
              <LoginPage />
            </RedirectIfAuthenticated>
          }
        />{" "}
        {/* <Route path="/unauthorized" element={<UnauthorizedPage />} /> */}
      </Routes>
    </AuthProvider>
  );
};

export default App;
