import apiClient from "./client";

export async function registerUser(payload) {
  try {
    const res = await apiClient.post("/auth/register", payload);
    return {
      status: true,
      data: res.data,
      error: null,
    };
  } catch (error) {
    return {
      status: false,
      data: null,
      error: error?.response?.data?.detail || "Registration failed",
    };
  }
}

export async function loginUser(payload) {
  try {
    const res = await apiClient.post("/auth/login", payload);
    return {
      status: true,
      token: res.data?.access_token || null,
      tokenType: res.data?.token_type || "bearer",
      error: null,
    };
  } catch (error) {
    return {
      status: false,
      token: null,
      tokenType: null,
      error: error?.response?.data?.detail || "Login failed",
    };
  }
}