import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { User } from "../models/User";
import { ApiClient } from "../config/ApiClient";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email: string, password: string) => {
    try {
      const response = await ApiClient.post("/auth/login", {
        email,
        password,
      });

      setUser({
        id: response.data.user_id,
        email: response.data.email,
        firstname: response.data.firstname,
        lastname: response.data.lastname,
        permissions: response.data.permissions,
        blocked: response.data.blocked,
        last_connected: response.data.last_connected,
        roles: response.data.roles,
        groups: response.data.groups,
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error("Invalid credentials");
      } else {
        console.error("Login error", error);
        throw new Error("Connection error");
      }
    }
  };

  const logout = async () => {
    try {
      // Call the API to remove the cookie
      await ApiClient.post("/auth/logout");
      setUser(null);
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const checkAuth = async () => {
    try {
      if (location.pathname != "/login" && user != null) {
        return true;
      }

      setIsLoading(true);
      // The cookie will be sent automatically with the request
      const response = await ApiClient.get("/auth/check");

      setUser({
        id: response.data.user_id,
        email: response.data.email,
        firstname: response.data.firstname,
        lastname: response.data.lastname,
        permissions: response.data.permissions,
        blocked: response.data.blocked,
        last_connected: response.data.last_connected,
        roles: response.data.roles,
        groups: response.data.groups,
      });
      return true;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status !== 401) {
        console.error("Auth check failed", error);
      }
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (location.pathname != "/login") {
      checkAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
