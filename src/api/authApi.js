import { apiClient, setAccessToken } from "./client";

export async function requestSchoolEmailVerification(email) {
  return apiClient.post("/auth/school-email-verifications", { email });
}

export async function signup({ email, verificationCode, password, name, age }) {
  const response = await apiClient.post("/auth/signup", {
    email,
    verificationCode: verificationCode || null,
    password,
    name,
    age: Number(age),
  });

  if (!response?.accessToken) {
    throw new Error("로그인 토큰을 받지 못했습니다.");
  }
  setAccessToken(response?.accessToken);
  return response;
}

export async function login({ email, password }) {
  const response = await apiClient.post("/auth/login", { email, password });
  if (!response?.accessToken) {
    throw new Error("로그인 토큰을 받지 못했습니다.");
  }
  setAccessToken(response?.accessToken);
  return response;
}

export async function logout() {
  return apiClient.post("/auth/logout");
}
