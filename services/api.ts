
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api';

export async function apiRequest(
  endpoint: string,
  method = "GET",
  body?: any,
  token?: string
) {
  // Retrieve token from storage if not provided directly
  const authToken = token || localStorage.getItem("fitpro_jwt");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || data.message || "Request failed");
    }

    return data;
  } catch (error: any) {
    console.error(`API Request Failed: ${endpoint}`, error);
    throw error;
  }
}

export const AuthAPI = {
  register: async (data: any) => apiRequest('/auth/register', 'POST', data),
  verifyEmail: async (data: any) => apiRequest('/auth/verify-email', 'POST', data),
  login: async (data: any) => apiRequest('/auth/login', 'POST', data),
  me: async () => apiRequest('/auth/me', 'GET'),
  logout: async () => apiRequest('/auth/logout', 'POST'),
};

export default apiRequest;
