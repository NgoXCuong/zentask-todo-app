import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

// Create Context
const AuthContext = createContext(null);

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth on mount
  useEffect(() => {
    const currentUser = authAPI.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  // Login
  const login = async (email, password) => {
    const { data, ok } = await authAPI.login(email, password);
    if (ok) {
      setUser(data.user);
      return { ok: true };
    }
    return { ok: false, message: data?.message || "Đăng nhập thất bại" };
  };

  // Register
  const register = async (full_name, email, password) => {
    const { data, ok } = await authAPI.register(full_name, email, password);
    if (ok) {
      setUser(data.user);
      return { ok: true };
    }
    return { ok: false, message: data?.message || "Đăng ký thất bại" };
  };

  // Logout
  const logout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  // Context value
  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export default AuthContext;
