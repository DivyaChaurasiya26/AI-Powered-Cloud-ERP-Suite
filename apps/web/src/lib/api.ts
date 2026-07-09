const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const getToken = () => localStorage.getItem("token");

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    throw new ApiError(401, "Unauthorized");
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, body.message || "Request failed");
  }
  return body;
};

export const apiGet = (path: string) => apiFetch(path);
export const apiPost = (path: string, data?: unknown) =>
  apiFetch(path, { method: "POST", body: data ? JSON.stringify(data) : undefined });
export const apiPatch = (path: string, data?: unknown) =>
  apiFetch(path, { method: "PATCH", body: data ? JSON.stringify(data) : undefined });
export const apiPut = (path: string, data?: unknown) =>
  apiFetch(path, { method: "PUT", body: data ? JSON.stringify(data) : undefined });
export const apiDelete = (path: string) => apiFetch(path, { method: "DELETE" });

export const API_BASE_URL = API_BASE;
