import { apiClient } from "./client";

export function getMe() {
  return apiClient.get("/users/me");
}

export function updateProfile(profile) {
  return apiClient.put("/users/me/profile", profile);
}

export function getAllergies() {
  return apiClient.get("/users/me/allergies");
}

export function addAllergy(allergy) {
  return apiClient.post("/users/me/allergies", allergy);
}

export function deleteAllergy(allergyId) {
  return apiClient.delete(`/users/me/allergies/${allergyId}`);
}
