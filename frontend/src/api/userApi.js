import apiClient from "./client";

export async function getCurrentUserProfile() {
  try {
    const res = await apiClient.get("/users/me");
    return {
      status: true,
      data: res.data,
      error: null,
    };
  } catch (error) {
    return {
      status: false,
      data: null,
      error: error?.response?.data?.detail || "Failed to load user profile",
    };
  }
}

export async function saveOpenRouterApiKey(apiKey) {
  try {
    const res = await apiClient.put("/users/api-key", { api_key: apiKey });
    return {
      status: true,
      data: res.data,
      error: null,
    };
  } catch (error) {
    return {
      status: false,
      data: null,
      error: error?.response?.data?.detail || "Failed to save API key",
    };
  }
}
