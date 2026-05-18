import { apiClient } from "./client";

export function createMealLog({ logDate, mealType, memo }) {
  return apiClient.post("/meal-logs", {
    logDate,
    mealType,
    memo: memo || null,
  });
}

export function getMealLogsByDate(date) {
  return apiClient.get("/meal-logs", {
    params: { date },
  });
}

export function getMealLog(mealLogId) {
  return apiClient.get(`/meal-logs/${mealLogId}`);
}

export function addFoodItems(mealLogId, items) {
  return apiClient.post(`/meal-logs/${mealLogId}/food-items`, {
    items,
  });
}

export function addMenuOption({ menuOptionId, memo, itemName }) {
  return apiClient.post("/meal-logs/from-menu-option", {
    menuOptionId,
    memo: memo || null,
    itemName: itemName || null,
  });
}

export function setMealLogItemExcluded({
  mealLogId,
  mealLogItemId,
  excluded = true,
}) {
  return apiClient.patch(
    `/meal-logs/${mealLogId}/items/${mealLogItemId}/exclude`,
    null,
    { params: { excluded } }
  );
}

export function getDailySummary(date) {
  return apiClient.get("/home/daily-summary", {
    params: { date },
  });
}

export function getYesterdayFeedback() {
  return apiClient.get("/home/yesterday-feedback");
}
