import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";
const ACCESS_TOKEN_KEY = "kkirok_access_token";

function storage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function getAccessToken() {
  return storage()?.getItem(ACCESS_TOKEN_KEY) ?? "";
}

export function setAccessToken(token) {
  if (!token) return;
  storage()?.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
  storage()?.removeItem(ACCESS_TOKEN_KEY);
}

export class ApiRequestError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message || "요청을 처리하지 못했습니다.");
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function unwrapApiResponse(payload) {
  if (!payload || typeof payload.success !== "boolean") return payload;

  if (payload.success) {
    return payload.data ?? null;
  }

  throw new ApiRequestError(payload.error?.message, {
    code: payload.error?.code,
    details: payload.error?.details,
  });
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => unwrapApiResponse(response.data),
  (error) => {
    const status = error.response?.status;
    const payload = error.response?.data;
    const apiError = payload?.error;

    if (status === 401) {
      clearAccessToken();
    }

    throw new ApiRequestError(
      apiError?.message || error.message || "요청을 처리하지 못했습니다.",
      {
        status,
        code: apiError?.code,
        details: apiError?.details,
      }
    );
  }
);
