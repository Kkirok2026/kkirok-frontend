import { useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import Button from "../components/common/Button";
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
    apiKey: "carbG",
    legacyKey: "carbs",
    unit: "g",
  },
  {
    key: "sugar",
    label: "당",
    icon: SugarIcon,
    apiKey: "sugarG",
    legacyKey: "sugar",
    unit: "g",
  },
  {
    key: "sodium",
    label: "나트륨",
    icon: SodiumIcon,
    apiKey: "sodiumMg",
    legacyKey: "sodium",
    unit: "mg",
  },
  {
    key: "protein",
    label: "단백질",
    icon: ProteinIcon,
    apiKey: "proteinG",
    legacyKey: "protein",
    unit: "g",
  },
  {
    key: "fat",
    label: "지방",
    icon: FatIcon,
    apiKey: "fatG",
    legacyKey: "fat",
    unit: "g",
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

function NutrientIconCard({ icon, label, value }) {
  return (
    <div className="w-[68px]">
      <div className="h-[68px] rounded-[9px] bg-[#f8f8f8] flex items-center justify-center">
        <img
          src={icon}
          alt={label}
          className="max-w-[48px] max-h-[48px] object-contain"
        />
      </div>

      <p className="mt-[8px] text-[11px] leading-none font-bold text-[#272932] tracking-[-0.02em]">
        {label}
      </p>

      <p className="mt-[6px] text-[10px] leading-none font-light text-[#6f7075] tracking-[-0.02em]">
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
            name: routeFoodName || "감자샐러드",
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

  const nutrients = useMemo(() => {
    const totals = food?.nutrients ?? {};

    return NUTRIENT_META.map((item) => {
      const rawValue = totals[item.apiKey] ?? totals[item.legacyKey];

      let value = `0${item.unit}`;

      if (typeof rawValue === "number") {
        value = `${toRounded(rawValue)}${item.unit}`;
      } else if (typeof rawValue === "string" && rawValue.trim() !== "") {
        value = rawValue;
      }

      return {
        ...item,
        value,
      };
    });
  }, [food]);

  const foodName = food?.foodName ?? food?.name ?? routeFoodName ?? "음식";

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
      setError(addError.message || "식단에 추가하지 못했습니다.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <MobileLayout>
      <header className="absolute left-0 right-0 top-[58px] flex flex-col items-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-[46px] top-[0px] w-[28px] h-[28px] rounded-[7px] bg-[#f8f8f8] text-[#272932] flex items-center justify-center text-[20px] leading-none"
        >
          ‹
        </button>

        <p className="text-[15px] leading-none font-normal text-[#272932] tracking-[-0.02em]">
          Meal details
        </p>

        <KkirokLogo className="mt-[5px]" />
      </header>

      <main className="absolute left-[58px] right-[58px] top-[166px]">
        {isLoading && (
          <p className="text-xs text-neutral-400">
            음식 정보를 불러오는 중입니다.
          </p>
        )}

        {error && <p className="mb-5 text-xs text-[#ff5b5b]">{error}</p>}

        {!isLoading && food && (
          <>
            <h1
              className="text-[28px] text-[#272932] tracking-[-0.05em]"
              style={{
                fontWeight: 650,
              }}
            >
              {foodName}
            </h1>

            <div className="mt-[28px] grid grid-cols-4 gap-x-[14px] gap-y-[34px]">
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

      <div className="absolute left-8 right-8 bottom-20">
        <Button
          disabled={!food || isAdding || !hasValidFoodId}
          onClick={handleAddFood}
        >
          {isAdding ? "추가 중..." : "식단에 추가"}
        </Button>
      </div>
    </MobileLayout>
  );
}