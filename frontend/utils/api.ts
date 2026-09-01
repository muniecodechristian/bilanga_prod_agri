import axios, { AxiosInstance } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://bilanga-app-backend2.vercel.app/api";

const TOKEN_KEY = "auth_token";

// ─── Création d'un client API avec token JWT depuis AsyncStorage ──────────────
export const createApiClient = (): AxiosInstance => {
  const api = axios.create({ baseURL: API_BASE_URL });

  api.interceptors.request.use(async (config: any) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return api;
};

// ─── Hook compatible avec les composants React ─────────────────────────────────
// Retourne un client API qui relit le token à chaque requête
export const useApiClient = (): AxiosInstance => {
  return createApiClient();
};

// ─── Auth API ──────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: any) => axios.post(`${API_BASE_URL}/auth/register`, data),
  login: (data: any) => axios.post(`${API_BASE_URL}/auth/login`, data),
  logout: (api: AxiosInstance) => api.post("/auth/logout"),
  getMe: (api: AxiosInstance) => api.get("/auth/me"),
};

// ─── User API ──────────────────────────────────────────────────────────────────
export const userApi = {
  getCurrentUser: (api: AxiosInstance) => api.get("/users/me"),
  updateProfile: (api: AxiosInstance, data: any) => api.put("/users/profile", data),
  getUserProfile: (api: AxiosInstance, username: string) =>
    api.get(`/users/profile/${username}`),
  followUser: (api: AxiosInstance, targetUserId: string) =>
    api.post(`/users/follow/${targetUserId}`),
};

// ─── Post API ──────────────────────────────────────────────────────────────────
export const postApi = {
  createPost: (api: AxiosInstance, data: { content: string; image?: string }) =>
    api.post("/posts", data),
  getPosts: (api: AxiosInstance) => api.get("/posts"),
  getUserPosts: (api: AxiosInstance, username: string) =>
    api.get(`/posts/user/${username}`),
  likePost: (api: AxiosInstance, postId: string) => api.post(`/posts/${postId}/like`),
  deletePost: (api: AxiosInstance, postId: string) => api.delete(`/posts/${postId}`),
};

// ─── Récoltes API ──────────────────────────────────────────────────────────────
export const RecoltespostApi = {
  createRecoltesPost: (
    api: AxiosInstance,
    data: {
      images: String;
      title: String;
      phone: String;
      description: String;
      price: String;
      category: String;
      quantity: String;
      city: String;
      country: String;
    }
  ) => api.post("/recoltes", data),
  getRecoltesPosts: (api: AxiosInstance) => api.get("/recoltes"),
  deletePost: (api: AxiosInstance, postId: string) =>
    api.delete(`/recoltes/${postId}`),
};

// ─── Comment API ───────────────────────────────────────────────────────────────
export const commentApi = {
  createComment: (api: AxiosInstance, postId: string, content: string) =>
    api.post(`/comments/post/${postId}`, { content }),
};
