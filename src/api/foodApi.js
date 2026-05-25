import { apiClient } from "./client";

export function searchFoods(q, limit = 20) {
  return apiClient.get("/foods/search", {
    params: { q, limit },
  });
}

export function getFood(foodId) {
  return apiClient.get(`/foods/${foodId}`);
}

export function createCustomFood(food) {
  return apiClient.post("/foods/custom", food);
}

export function updateFoodCalories(foodId, calories) {
  return apiClient.patch(`/foods/${foodId}/calories`, calories);
}
