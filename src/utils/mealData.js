export const MEAL_LABELS = {
  BREAKFAST: "아침",
  LUNCH: "점심",
  DINNER: "저녁",
  SNACK: "간식",
};

export const MEAL_KEY_TO_TYPE = {
  breakfast: "BREAKFAST",
  lunch: "LUNCH",
  dinner: "DINNER",
  snack: "SNACK",
};

export const MEAL_TYPE_TO_KEY = {
  BREAKFAST: "breakfast",
  LUNCH: "lunch",
  DINNER: "dinner",
  SNACK: "snack",
};

export function formatDateKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function toRounded(value) {
  return Math.round(toNumber(value));
}

export function emptyMeals() {
  return {
    breakfast: { label: "아침", mealType: "BREAKFAST", items: [], foods: [] },
    lunch: { label: "점심", mealType: "LUNCH", items: [], foods: [] },
    dinner: { label: "저녁", mealType: "DINNER", items: [], foods: [] },
    snack: { label: "간식", mealType: "SNACK", items: [], foods: [] },
  };
}

export function toMealDisplay(mealLog, fallbackKey) {
  const mealType = mealLog?.mealType || MEAL_KEY_TO_TYPE[fallbackKey] || "LUNCH";
  const mealKey = MEAL_TYPE_TO_KEY[mealType] || fallbackKey || "lunch";
  const totals = mealLog?.totals || {};
  const visibleItems = (mealLog?.items || []).filter((item) => !item.excluded);

  return {
    mealKey,
    mealLogId: mealLog?.mealLogId,
    logDate: mealLog?.logDate,
    mealType,
    label: MEAL_LABELS[mealType] || "식단",
    kcal: toRounded(totals.caloriesKcal),
    carbs: toRounded(totals.carbG),
    protein: toRounded(totals.proteinG),
    fat: toRounded(totals.fatG),
    sugar: toRounded(totals.sugarG),
    sodium: toRounded(totals.sodiumMg),
    items: visibleItems,
    foods: visibleItems.map((item) => item.itemName),
  };
}

export function toMealsByType(mealLogList) {
  const meals = emptyMeals();

  for (const mealLog of mealLogList?.items || []) {
    const meal = toMealDisplay(mealLog);
    meals[meal.mealKey] = meal;
  }

  return meals;
}

export function toDailyDisplay(summary, mealLogList) {
  const totals = summary?.totals || {};

  return {
    date: summary?.date,
    totalKcal: toRounded(totals.caloriesKcal),
    macros: {
      protein: toRounded(totals.proteinG),
      fat: toRounded(totals.fatG),
      carbs: toRounded(totals.carbG),
    },
    warnings: summary?.warnings || [],
    recommendedTargets: summary?.recommendedTargets || null,
    macroRatios: summary?.macroRatios || null,
    meals: toMealsByType(mealLogList),
  };
}

function middleOfRange(min, max) {
  const low = toNumber(min, NaN);
  const high = toNumber(max, NaN);

  if (Number.isFinite(low) && Number.isFinite(high)) {
    return Math.round((low + high) / 2);
  }

  if (Number.isFinite(high)) return Math.round(high);
  if (Number.isFinite(low)) return Math.round(low);
  return 0;
}

export function targetsToNutrition(recommendedTargets) {
  if (!recommendedTargets) {
    return {
      carbs: 0,
      protein: 0,
      fat: 0,
    };
  }

  return {
    carbs: middleOfRange(
      recommendedTargets.carbMinG,
      recommendedTargets.carbMaxG
    ),
    protein: middleOfRange(
      recommendedTargets.proteinMinG,
      recommendedTargets.proteinMaxG
    ),
    fat: middleOfRange(recommendedTargets.fatMinG, recommendedTargets.fatMaxG),
  };
}

export function genderToApi(gender) {
  const normalized = `${gender || ""}`.trim().toUpperCase();

  if (normalized === "MALE" || normalized === "M") return "MALE";
  if (normalized === "FEMALE" || normalized === "F") return "FEMALE";
  return "OTHER";
}

export function targetPeriodUnitToApi(unit) {
  const normalized = `${unit || ""}`.trim().toUpperCase();

  if (normalized === "WEEK") return "WEEK";
  return "MONTH";
}

export function targetPeriodLabel(value, unit) {
  if (!value) return "-";
  const label = targetPeriodUnitToApi(unit) === "WEEK" ? "주" : "개월";
  return `${value}${label}`;
}
