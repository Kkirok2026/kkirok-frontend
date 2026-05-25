import { apiClient } from "./client";

export function getUniversities() {
  return apiClient.get("/universities");
}

export function getDiningPlaces(universityId) {
  return apiClient.get("/dining-places", {
    params: { universityId },
  });
}

export function getDailyMenu({ universityId, date, mealType }) {
  return apiClient.get("/menus/daily", {
    params: { universityId, date, mealType },
  });
}

export function compareMenus({
  universityId,
  date,
  mealType,
  studentOptionId,
}) {
  return apiClient.get("/menus/compare", {
    params: {
      universityId,
      date,
      mealType,
      studentOptionId: studentOptionId || undefined,
    },
  });
}

export function updateMenuOptionCalories(optionId, caloriesKcal) {
  return apiClient.patch(`/menus/options/${optionId}/calories`, {
    caloriesKcal,
  });
}
