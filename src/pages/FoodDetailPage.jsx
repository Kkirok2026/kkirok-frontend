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
  toMealDisplay,
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

async function ensureMealLog({ mealLogId, date, mealType }) {
  if (mealLogId) return Number(mealLogId);

  try {
    const created = await createMealLog({
      logDate: date,
      mealType,
      memo: "",
    });

    return created.mealLogId;
  } catch (error) {
    if (error.code !== "MEAL_LOG_ALREADY_EXISTS") throw error;

    const list = await getMealLogsByDate(date);
    const existing = (list?.items ?? []).find(
      (mealLog) => mealLog.mealType === mealType
    );

    if (!existing?.mealLogId) throw error;
    return existing.mealLogId;
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

export default function FoodDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();

  const foodId = params.foodId;
  const routeFoodName = params.foodName
    ? decodeURIComponent(params.foodName)
    : "";

  const [food, setFood] = useState(location.state?.food ?? null);
  const [isLoading, setIsLoading] = useState(Boolean(foodId));
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  const date = searchParams.get("date") || formatDateKey(new Date());
  const mealType = searchParams.get("mealType") || "LUNCH";
  const mealLogId = searchParams.get("mealLogId");

  const numericFoodId = Number(foodId);
  const hasValidFoodId =
    foodId !== undefined &&
    foodId !== null &&
    foodId !== "" &&
    Number.isFinite(numericFoodId);

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

  const handleAddFood = async () => {
    if (!hasValidFoodId || isAdding) return;

    setIsAdding(true);
    setError("");

    try {
      const targetMealLogId = await ensureMealLog({
        mealLogId,
        date,
        mealType,
      });

      const updatedMeal = await addFoodItems(targetMealLogId, [
        { foodId: numericFoodId },
      ]);

      const meal = toMealDisplay(updatedMeal);
      const mealKey = meal.mealKey || MEAL_TYPE_TO_KEY[mealType] || "lunch";

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

  return (
    <MobileLayout>
      <div className="absolute inset-0 bg-white">
        <header className="absolute left-0 right-0 top-[58px] flex flex-col items-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="이전 페이지로 이동"
            className="absolute left-[58px] top-[0px] flex h-[28px] w-[28px] items-center justify-center rounded-[7px] bg-[#f8f8f8] text-[#272932] transition active:scale-[0.96]"
          >
            <span className="translate-y-[-1px] text-[20px] font-light leading-none">
              ‹
            </span>
          </button>

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

        <div className="absolute bottom-[120px] left-1/2 z-30 w-[260px] -translate-x-1/2">
          <button
            type="button"
            disabled={!food || isAdding || !hasValidFoodId}
            onClick={handleAddFood}
            className="h-[56px] w-full rounded-[10px] bg-black text-[15px] font-bold text-white tracking-[-0.02em] shadow-[0_16px_24px_rgba(0,0,0,0.22)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
          >
            {isAdding ? "추가 중..." : "식단에 추가"}
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}