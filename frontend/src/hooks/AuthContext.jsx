import { createContext, useContext, useMemo, useState } from "react";
import { loginUser, registerUser } from "../api/authApi";

const AuthContext = createContext(null);

const getStoredToken = () => localStorage.getItem("access_token") || "";

const parseUserFromToken = (token) => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const decoded = JSON.parse(atob(padded));

    return decoded?.sub || null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getStoredToken);

  const setAuthToken = (nextToken) => {
    if (nextToken) {
      localStorage.setItem("access_token", nextToken);
      setToken(nextToken);
      return;
    }

    localStorage.removeItem("access_token");
    setToken("");
  };

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    if (res.status && res.token) {
      setAuthToken(res.token);
      return { status: true, error: null };
    }

    return { status: false, error: res.error || "Invalid credentials" };
  };

  const register = async (email, password) => {
    const res = await registerUser({ email, password });
    if (res.status) {
      return { status: true, error: null };
    }

    return { status: false, error: res.error || "Registration failed" };
  };

  const logout = () => {
    setAuthToken("");
  };

  const value = useMemo(
    () => ({
      token,
      userId: parseUserFromToken(token),
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
