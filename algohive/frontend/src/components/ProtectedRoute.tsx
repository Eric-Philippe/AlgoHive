import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  target: "staff" | "participant";
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, target }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, checkAuth, user } = useAuth();
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Only check authentication once when the component is mounted
    if (!initialCheckDone && isLoading) {
      const verifyAuth = async () => {
        await checkAuth();
        setInitialCheckDone(true);
      };
      verifyAuth();
    }
  }, [checkAuth, initialCheckDone, isLoading]);

  // Show loading state only during initial authentication check
  if (isLoading && !initialCheckDone) {
    return <div>Chargement...</div>;
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Redirect if user is not staff
  if (
    target == "staff" &&
    user &&
    user.groups &&
    user.groups.length > 0 &&
    (user.roles == null || user.roles.length == 0)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // // Redirect if user is not a participant
  if (target == "participant" && user && user.roles && user.roles.length > 0) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
