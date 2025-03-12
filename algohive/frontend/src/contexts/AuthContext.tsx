import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { User } from "../models/User";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

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
      axios
        .post(API_ENDPOINT + "/auth/login", {
          email,
          password,
        })
        .then((response) => {
          setUser({ id: response.data.user_id, email: response.data.email });
        });
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Appeler l'API pour supprimer le cookie
      await axios.post(API_ENDPOINT + "/auth/logout");
      setUser(null);
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      // Le cookie sera envoyé automatiquement avec la requête
      const response = await axios.get(API_ENDPOINT + "/auth/check", {
        withCredentials: true,
      });

      setUser({ id: response.data.user_id, email: response.data.email });
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
    // Vérifier l'authentification au chargement
    checkAuth();
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
