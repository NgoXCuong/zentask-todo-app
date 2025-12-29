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
    const checkAuthStatus = async () => {
      const currentUser = authAPI.getCurrentUser();
      if (currentUser) {
        // Verify token is still valid and get fresh user data
        const { data, ok } = await authAPI.checkAuth();
        if (ok && data.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          // Token invalid, clear it
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Login
  const login = async (email, password) => {
    const { data, ok } = await authAPI.login(email, password);
    if (ok && data.user) {
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      return { ok: true };
    }
    return { ok: false, message: data?.message || "Đăng nhập thất bại" };
  };

  // Register
  const register = async (full_name, email, password) => {
    const { data, ok } = await authAPI.register(full_name, email, password);
    if (ok && data.user) {
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      return { ok: true };
    }
    return { ok: false, message: data?.message || "Đăng ký thất bại" };
  };

  // Logout
  const logout = async () => {
    await authAPI.logout();
    setUser(null);
    localStorage.removeItem("user");
  };

  // Update profile
  const updateProfile = async (profileData) => {
    const { data, ok } = await authAPI.updateProfile(profileData);
    if (ok && data.user) {
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      return { ok: true };
    }
    return { ok: false, message: data?.message || "Cập nhật thất bại" };
  };

  // Update user data directly (for cases where API was already called)
  const updateUserData = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Context value
  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    updateUserData,
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
