import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types/index.js";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, passwordPlain: string) => Promise<void>;
  register: (fullName: string, email: string, passwordPlain: string) => Promise<void>;
  logout: () => void;
  updateProfile: (fullName: string, email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on boot
    const storedToken = localStorage.getItem("copilot_token");
    if (storedToken) {
      setToken(storedToken);
      fetchSession(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchSession = async (authToken: string) => {
    try {
      const res = await fetch("/api/auth/session", {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // Stale or invalid session
        logout();
      }
    } catch (err) {
      console.error("Failed to restore session:", err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, passwordPlain: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: passwordPlain })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("copilot_token", data.token);
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName: string, email: string, passwordPlain: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password: passwordPlain })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }
      // Automatical log in immediately upon registration
      await login(email, passwordPlain);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("copilot_token");
    setLoading(false);
  };

  const updateProfile = async (fullName: string, email: string) => {
    if (!token) return;
    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ fullName, email })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to edit profile details");
    }
    setUser(data.user);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
};
