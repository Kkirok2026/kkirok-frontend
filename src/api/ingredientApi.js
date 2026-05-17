import { apiClient } from "./client";

export function searchIngredients(q, limit = 20) {
  return apiClient.get("/ingredients/search", {
    params: { q, limit },
  });
}

export function addIngredientAllergies(items) {
  return apiClient.post("/users/me/ingredient-allergies/bulk", {
    items,
  });
}

export function getIngredientAllergies() {
  return apiClient.get("/users/me/ingredient-allergies");
}
