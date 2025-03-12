import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode;
}

const RedirectIfAuthenticated = ({
  children,
}: RedirectIfAuthenticatedProps) => {
  const { user } = useAuth();

  if (user) {
    // If the user is authenticated, redirect to the home page
    return <Navigate to="/" />;
  }

  // If the user is not authenticated, render the children (LoginPage)
  return children;
};

export default RedirectIfAuthenticated;
