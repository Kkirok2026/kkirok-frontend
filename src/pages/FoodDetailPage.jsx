import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import PageHeader from "../components/layout/PageHeader";
import Button from "../components/common/Button";
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

export default function FoodDetailPage() {
  const navigate = useNavigate();
  const { foodId } = useParams();
  const [searchParams] = useSearchParams();
  const [food, setFood] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  const date = searchParams.get("date") || formatDateKey(new Date());
  const mealType = searchParams.get("mealType") || "LUNCH";
  const mealLogId = searchParams.get("mealLogId");

  useEffect(() => {
    let ignore = false;

    async function loadFood() {
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
  }, [foodId]);

  const nutrients = useMemo(() => {
    const totals = food?.nutrients || {};

    return [
      { name: "탄수화물", value: `${toRounded(totals.carbG)}g`, icon: "C" },
      { name: "당", value: `${toRounded(totals.sugarG)}g`, icon: "S" },
      { name: "나트륨", value: `${toRounded(totals.sodiumMg)}mg`, icon: "Na" },
      { name: "단백질", value: `${toRounded(totals.proteinG)}g`, icon: "P" },
      { name: "지방", value: `${toRounded(totals.fatG)}g`, icon: "F" },
      {
        name: "열량",
        value: `${toRounded(totals.caloriesKcal)}kcal`,
        icon: "K",
      },
    ];
  }, [food]);

  const handleAddFood = async () => {
    if (!foodId || isAdding) return;

    setIsAdding(true);
    setError("");

    try {
      const targetMealLogId = await ensureMealLog({
        mealLogId,
        date,
        mealType,
      });
      const updatedMeal = await addFoodItems(targetMealLogId, [
        { foodId: Number(foodId) },
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
      <div className="absolute inset-0 overflow-y-auto px-7 pb-[152px]">
        <PageHeader eyebrow="Meal details" title="77ㅣ록" showBack />

        {isLoading && (
          <p className="text-xs text-neutral-400">음식 정보를 불러오는 중입니다.</p>
        )}

        {error && <p className="mb-5 text-xs text-[#ff5b5b]">{error}</p>}

        {food && (
          <>
            <h2 className="text-xl font-extrabold mb-8">{food.foodName}</h2>

            <div className="grid grid-cols-3 gap-4">
              {nutrients.map((item) => (
                <div key={item.name}>
                  <div className="h-16 rounded-xl bg-neutral-50 flex items-center justify-center text-sm font-bold text-[#6da60f] mb-2">
                    {item.icon}
                  </div>

                  <p className="text-xs font-bold">{item.name}</p>
                  <p className="text-[10px] text-neutral-400">{item.value}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="absolute left-8 right-8 bottom-20">
        <Button disabled={!food || isAdding} onClick={handleAddFood}>
          {isAdding ? "추가 중..." : "식단에 추가"}
        </Button>
      </div>
    </MobileLayout>
  );
}
