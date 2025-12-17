import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthAPI } from "../services/api";

interface User {
  id: string;
  email: string;
  role: 'athlete' | 'coach' | 'admin';
  name?: string;
  [key: string]: any;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children?: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("fitpro_jwt"));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await AuthAPI.me();
          setUser(userData);
        } catch (error) {
          console.error("Session expired or invalid");
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("fitpro_jwt", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("fitpro_jwt");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      user, 
      isAuthenticated: !!token, 
      isLoading,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}