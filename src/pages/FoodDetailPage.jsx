import { useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import KkirokLogo from "../components/common/KkirokLogo";

import { getFood } from "../api/foodApi";
import {
  addFoodItems,
  createMealLog,
  getMealLogsByDate,
} from "../api/mealLogApi";
import {
  MEAL_TYPE_TO_KEY,
  formatDateKey,
  toMealsByType,
  toRounded,
} from "../utils/mealData";

import CarbsIcon from "../assets/icons/Carbs.png";
import SugarIcon from "../assets/icons/Sugar.png";
import SodiumIcon from "../assets/icons/Sodium.png";
import ProteinIcon from "../assets/icons/Protein.png";
import FatIcon from "../assets/icons/Fat.png";

const NUTRIENT_META = [
  {
    key: "carbs",
    label: "탄수화물",
    icon: CarbsIcon,
    apiKeys: ["carbG", "carbs", "carbohydrateG", "carbohydrate"],
    unit: "g",
  },
  {
    key: "sugar",
    label: "당",
    icon: SugarIcon,
    apiKeys: ["sugarG", "sugar", "sugarsG", "sugars"],
    unit: "g",
  },
  {
    key: "sodium",
    label: "나트륨",
    icon: SodiumIcon,
    apiKeys: ["sodiumMg", "sodium", "natriumMg"],
    unit: "mg",
  },
  {
    key: "protein",
    label: "단백질",
    icon: ProteinIcon,
    apiKeys: ["proteinG", "protein"],
    unit: "g",
  },
  {
    key: "fat",
    label: "지방",
    icon: FatIcon,
    apiKeys: ["fatG", "fat", "totalFatG"],
    unit: "g",
  },
  {
    key: "cholesterol",
    label: "콜레스테롤",
    icon: SugarIcon,
    apiKeys: ["cholesterolMg", "cholesterol"],
    unit: "mg",
  },
];

const MEAL_OPTIONS = [
  { mealType: "BREAKFAST", mealKey: "breakfast", label: "아침" },
  { mealType: "LUNCH", mealKey: "lunch", label: "점심" },
  { mealType: "DINNER", mealKey: "dinner", label: "저녁" },
  { mealType: "SNACK", mealKey: "snack", label: "간식" },
];

function getMealLogItems(mealLogList) {
  if (Array.isArray(mealLogList)) return mealLogList;
  return mealLogList?.items || [];
}

async function findExistingMealLog({ date, mealType }) {
  const list = await getMealLogsByDate(date);
  const items = getMealLogItems(list);
  const matches = items.filter((mealLog) => mealLog.mealType === mealType);

  return matches[matches.length - 1] || null;
}

async function ensureMealLog({ mealLogId, date, mealType }) {
  if (mealLogId) return Number(mealLogId);

  const existing = await findExistingMealLog({ date, mealType });

  if (existing?.mealLogId) {
    return existing.mealLogId;
  }

  try {
    const created = await createMealLog({
      logDate: date,
      mealType,
      memo: "",
    });

    return created.mealLogId;
  } catch (error) {
    const retryExisting = await findExistingMealLog({ date, mealType });

    if (retryExisting?.mealLogId) {
      return retryExisting.mealLogId;
    }

    throw error;
  }
}

function readNumberValue(source, keys) {
  for (const key of keys) {
    const value = source?.[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
      const number = Number(value);
      if (Number.isFinite(number)) return number;
    }
  }

  return 0;
}

function readRawValue(source, keys) {
  for (const key of keys) {
    const value = source?.[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }
  }

  return null;
}

function formatNutrientValue(rawValue, unit) {
  if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
    return `${toRounded(rawValue)}${unit}`;
  }

  if (typeof rawValue === "string" && rawValue.trim() !== "") {
    const hasUnit = /[a-zA-Z가-힣]/.test(rawValue);
    return hasUnit ? rawValue : `${rawValue}${unit}`;
  }

  return `0${unit}`;
}

function NutrientIconCard({ icon, label, value }) {
  return (
    <div className="w-[68px]">
      <div className="flex h-[68px] items-center justify-center rounded-[9px] bg-[#f8f8f8]">
        <img
          src={icon}
          alt={label}
          className="max-h-[48px] max-w-[48px] object-contain"
        />
      </div>

      <p className="mt-[8px] text-[11px] font-bold leading-none text-[#272932] tracking-[-0.02em]">
        {label}
      </p>

      <p className="mt-[7px] text-[10px] font-light leading-none text-[#6f7075] tracking-[-0.02em]">
        {value}
      </p>
    </div>
  );
}

function MealSelectModal({
  selectedMealType,
  onSelectMealType,
  onClose,
  onConfirm,
  isAdding,
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1f1f1f]">
      <div className="flex h-dvh w-full max-w-[430px] items-center justify-center">
        <div
          className="rounded-[10px] bg-white"
          style={{
            width: "280px",
            minHeight: "190px",
            padding: "28px 26px 24px",
          }}
        >
          <div className="flex items-start">
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="flex h-[24px] w-[24px] shrink-0 items-center justify-center text-[#272932]"
              style={{
                fontSize: "22px",
                lineHeight: "1",
                fontWeight: 300,
              }}
            >
              ×
            </button>

            <div className="flex-1 pr-[24px] text-center">
              <p
                className="text-[#272932] tracking-[-0.03em]"
                style={{
                  fontSize: "16px",
                  lineHeight: "1.1",
                  fontWeight: 700,
                }}
              >
                언제 먹었나요?
              </p>

              <p
                className="mt-[6px] text-[#8a8c90] tracking-[-0.03em]"
                style={{
                  fontSize: "12px",
                  lineHeight: "1",
                  fontWeight: 500,
                }}
              >
                입력된 시간대가 없어요
              </p>
            </div>
          </div>

          <div className="mt-[34px] flex items-center justify-between gap-[6px]">
            {MEAL_OPTIONS.map((option) => {
              const isSelected = selectedMealType === option.mealType;

              return (
                <button
                  key={option.mealType}
                  type="button"
                  onClick={() => onSelectMealType(option.mealType)}
                  className="flex items-center justify-center rounded-full tracking-[-0.03em]"
                  style={{
                    width: "50px",
                    height: "22px",
                    border: isSelected
                      ? "1px solid #9fc744"
                      : "1px solid #cfc6c6",
                    backgroundColor: isSelected ? "#c9ee58" : "#ffffff",
                    color: "#272932",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isAdding}
            className="mt-[22px] flex w-full items-center justify-center rounded-[7px] text-white tracking-[-0.02em] disabled:opacity-50"
            style={{
              height: "40px",
              backgroundColor: "#272932",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            {isAdding ? "추가 중..." : "선택"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FoodDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();

  const foodId = params.foodId;
  const routeFoodName = params.foodName
    ? decodeURIComponent(params.foodName)
    : "";

  const queryMealType = searchParams.get("mealType");
  const queryMealLogId = searchParams.get("mealLogId");
  const date = searchParams.get("date") || formatDateKey(new Date());
  const isMealAddFlow = searchParams.get("source") === "meal-add";

  const [food, setFood] = useState(location.state?.food ?? null);
  const [isLoading, setIsLoading] = useState(Boolean(foodId));
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState(
    queryMealType || "DINNER"
  );

  const numericFoodId = Number(foodId);
  const hasValidFoodId =
    foodId !== undefined &&
    foodId !== null &&
    foodId !== "" &&
    Number.isFinite(numericFoodId);

  const isOpenedFromMealDetail =
    searchParams.get("source") === "meal-detail" ||
    Boolean(location.state?.fromMealDetail || location.state?.meal);

    const hasFixedMealTarget = isMealAddFlow && Boolean(queryMealType);
  const shouldShowAddButton = !isOpenedFromMealDetail;

  useEffect(() => {
    let ignore = false;

    async function loadFood() {
      if (!hasValidFoodId) {
        if (!location.state?.food) {
          setFood({
            name: routeFoodName || "음식",
            nutrients: {},
          });
        }

        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await getFood(foodId);
        if (!ignore) setFood(response);
      } catch (loadError) {
        if (!ignore) {
          const fallbackFood = location.state?.food;
      
          if (
            fallbackFood &&
            (loadError.code === "FOOD_NOT_FOUND" || loadError.status === 404)
          ) {
            setFood(fallbackFood);
            setError("사용자가 추가한 메뉴입니다.");
            return;
          }
      
          setError(loadError.message || "음식 상세를 불러오지 못했습니다.");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadFood();

    return () => {
      ignore = true;
    };
  }, [foodId, hasValidFoodId, location.state?.food, routeFoodName]);

  const flatFoodData = useMemo(() => {
    const totals = food?.nutrients ?? {};

    return {
      ...food,
      ...totals,
    };
  }, [food]);

  const nutrients = useMemo(() => {
    return NUTRIENT_META.map((item) => {
      const rawValue = readRawValue(flatFoodData, item.apiKeys);

      return {
        ...item,
        value: formatNutrientValue(rawValue, item.unit),
      };
    });
  }, [flatFoodData]);

  const foodName = food?.foodName ?? food?.name ?? routeFoodName ?? "음식";

  const calories = useMemo(() => {
    return readNumberValue(flatFoodData, [
      "caloriesKcal",
      "calorieKcal",
      "energyKcal",
      "kcal",
      "calories",
      "calorie",
      "energy",
    ]);
  }, [flatFoodData]);

  const addFoodToMeal = async (targetMealType) => {
    if (!hasValidFoodId || isAdding) return;

    setIsAdding(true);
    setError("");

    try {
      const targetMealLogId = await ensureMealLog({
        mealLogId:
          hasFixedMealTarget && queryMealType === targetMealType
            ? queryMealLogId
            : null,
        date,
        mealType: targetMealType,
      });

      await addFoodItems(targetMealLogId, [{ foodId: numericFoodId }]);

      const refreshedMealLogs = await getMealLogsByDate(date);
      const meals = toMealsByType(refreshedMealLogs);

      const mealKey = MEAL_TYPE_TO_KEY[targetMealType] || "lunch";
      const meal = meals[mealKey];

      setIsMealModalOpen(false);

      navigate(`/meal-details/${mealKey}`, {
        state: {
          meal,
          date,
        },
      });
    } catch (addError) {
      if (addError.status === 401) {
        navigate("/login", { replace: true });
        return;
      }

      setError(addError.message || "식단에 추가하지 못했습니다.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddFood = () => {
    if (!hasValidFoodId || isAdding) return;

    if (hasFixedMealTarget) {
      addFoodToMeal(queryMealType);
      return;
    }

    setSelectedMealType("DINNER");
    setIsMealModalOpen(true);
  };

  const handleConfirmMealType = () => {
    addFoodToMeal(selectedMealType);
  };

  return (
    <MobileLayout>
      <div className="absolute inset-0 bg-white">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="이전 페이지로 이동"
          className="absolute z-30 flex items-center justify-center transition active:scale-[0.96]"
          style={{
            left: "24px",
            top: "54px",
            width: "34px",
            height: "34px",
            padding: 0,
            borderRadius: "9px",
            backgroundColor: "#f4f4f4",
            border: "1px solid #eeeeee",
            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.04)",
            color: "#272932",
          }}
        >
          <span
            style={{
              display: "block",
              fontSize: "24px",
              lineHeight: "1",
              fontWeight: 300,
              transform: "translateY(-2px)",
            }}
          >
            ‹
          </span>
        </button>

        <header className="absolute left-0 right-0 top-[58px] flex flex-col items-center">
          <p className="text-[15px] font-normal leading-none text-[#272932] tracking-[-0.02em]">
            Meal details
          </p>

          <KkirokLogo className="mt-[5px]" />
        </header>

        <main className="absolute left-[58px] right-[58px] top-[166px]">
          {isLoading && (
            <p className="text-[12px] font-light text-[#8a8c90]">
              음식 정보를 불러오는 중입니다.
            </p>
          )}

          {error && (
            <p className="mb-[18px] text-[12px] font-light text-[#ff5b5b]">
              {error}
            </p>
          )}

          {!isLoading && food && (
            <>
              <h1
                className="text-[22px] leading-[1.15] text-[#272932] tracking-[-0.05em]"
                style={{
                  fontWeight: 650,
                }}
              >
                {foodName}
              </h1>

              <p className="mt-[24px] text-[14px] font-bold leading-none text-[#272932] tracking-[-0.03em]">
                {toRounded(calories)} kcal
              </p>

              <div className="mt-[30px] grid grid-cols-4 gap-x-[14px] gap-y-[34px]">
                {nutrients.map((item) => (
                  <NutrientIconCard
                    key={item.key}
                    icon={item.icon}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </div>
            </>
          )}
        </main>

        {shouldShowAddButton && (
          <div
            className="absolute left-1/2 z-30 -translate-x-1/2"
            style={{
              bottom: "74px",
              width: "300px",
            }}
          >
            <button
              type="button"
              disabled={!food || isAdding || !hasValidFoodId}
              onClick={handleAddFood}
              className="flex w-full items-center justify-center transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
              style={{
                height: "50px",
                borderRadius: "10px",
                backgroundColor: "#000000",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                boxShadow: "0 18px 24px rgba(0, 0, 0, 0.25)",
              }}
            >
              {isAdding ? "추가 중..." : "식단에 추가"}
            </button>
          </div>
        )}

        {isMealModalOpen && (
          <MealSelectModal
            selectedMealType={selectedMealType}
            onSelectMealType={setSelectedMealType}
            onClose={() => setIsMealModalOpen(false)}
            onConfirm={handleConfirmMealType}
            isAdding={isAdding}
          />
        )}
      </div>
    </MobileLayout>
  );
}
