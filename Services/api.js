import axios from "axios";

const api = axios.create({
  baseURL: "https://compound-management.runasp.net/api/v1",
  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});

export const createFrontendSession = async (user, rememberMe = false) => {
  try {
    const response = await fetch("/api/auth/session", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        user,
        rememberMe,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data?.success) {
      throw new Error(data?.message || "Unable to create frontend session.");
    }

    return data;
  } catch (error) {
    console.error("Frontend session error:", error);

    throw error;
  }
};

export const clearFrontendSession = async () => {
  try {
    const response = await fetch("/api/auth/session", {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Unable to clear frontend session.");
    }

    return data;
  } catch (error) {
    console.error("Clear frontend session error:", error);

    throw error;
  }
};

export default api;
