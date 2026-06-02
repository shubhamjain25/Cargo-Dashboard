"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { decodeTokenPayload, type User, type UserRole } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  isStandard: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "cargo_portal_jwt";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Extract user from token
  const extractUserFromToken = useCallback((jwt: string): User | null => {
    const payload = decodeTokenPayload(jwt);
    if (!payload) return null;

    // Check if token is expired
    if (payload.exp * 1000 < Date.now()) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role as UserRole,
    };
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      const extractedUser = extractUserFromToken(storedToken);
      if (extractedUser) {
        setToken(storedToken);
        setUser(extractedUser);
      } else {
        // Token expired or invalid, clear it
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    setIsLoading(false);
  }, [extractUserFromToken]);

  const login = useCallback(
    (newToken: string) => {
      const extractedUser = extractUserFromToken(newToken);
      if (extractedUser) {
        localStorage.setItem(TOKEN_KEY, newToken);
        setToken(newToken);
        setUser(extractedUser);
      }
    },
    [extractUserFromToken]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAdmin: user?.role === "Admin",
    isStandard: user?.role === "Standard",
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
