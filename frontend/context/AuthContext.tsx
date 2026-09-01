import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────
export type UserRole = "proprietaire" | "client";

export interface AuthUser {
  _id: string;
  email?: string;
  phone?: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profilePicture?: string;
  bannerImage?: string;
  bio?: string;
  location?: string;
  followers?: string[];
  following?: string[];
  createdAt?: string;
}

interface RegisterData {
  email?: string;
  phone?: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
}

interface LoginData {
  identifier: string; // email | phone | username
  password: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isSignedIn: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://bilanga-app-backend2.vercel.app/api";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Charger la session sauvegardée au démarrage ──────────────────────────
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Erreur chargement session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  // ── Sauvegarder la session ────────────────────────────────────────────────
  const saveAuth = async (newToken: string, newUser: AuthUser) => {
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, newToken),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser)),
    ]);
    setToken(newToken);
    setUser(newUser);
  };

  // ── Supprimer la session ──────────────────────────────────────────────────
  const clearAuth = async () => {
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ]);
    setToken(null);
    setUser(null);
  };

  // ── REGISTER ──────────────────────────────────────────────────────────────
  const register = async (data: RegisterData) => {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, data);
    const { token: newToken, user: newUser } = response.data;
    await saveAuth(newToken, newUser);
  };

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  const login = async (data: LoginData) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, data);
    const { token: newToken, user: newUser } = response.data;
    await saveAuth(newToken, newUser);
  };

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      if (token) {
        await axios.post(
          `${API_BASE_URL}/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch {
      // ignorer l'erreur réseau côté logout (JWT stateless)
    } finally {
      await clearAuth();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isSignedIn: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext doit être utilisé à l'intérieur d'AuthProvider");
  }
  return ctx;
};
