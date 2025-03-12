import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
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

  // // Role-based access control if needed later
  // if (allowedRoles && user && !allowedRoles.includes(user.role)) {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  return <>{children}</>;
};

export default ProtectedRoute;
