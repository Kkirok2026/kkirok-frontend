import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import KkirokLogo from "../components/common/KkirokLogo";
import { getMealLog, setMealLogItemExcluded } from "../api/mealLogApi";
import {
  MEAL_KEY_TO_TYPE,
  MEAL_LABELS,
  toMealDisplay,
} from "../utils/mealData";

function emptyMeal(mealKey) {
  const mealType = MEAL_KEY_TO_TYPE[mealKey] || "BREAKFAST";

  return {
    mealKey,
    mealType,
    label: MEAL_LABELS[mealType] || "식단",
    kcal: 0,
    carbs: 0,
    protein: 0,
    fat: 0,
    foods: [],
    items: [],
  };
}

function NutritionSummaryBox({ label, value, unit = "g" }) {
  return (
    <div className="h-[56px] rounded-[13px] border border-[#d7d2d2] px-[14px] flex items-center justify-between">
      <span className="text-[12px] font-bold text-[#272932] tracking-[-0.02em]">
        {label}
      </span>

      <span className="text-[12px] font-bold text-[#69a80f] tracking-[-0.02em]">
        {value} {unit}
      </span>
    </div>
  );
}

function FoodRow({ item, onOpenDelete }) {
  return (
    <div className="h-[34px] flex items-center">
      <button
        type="button"
        className="flex-1 text-left text-[17px] font-normal text-[#272932] tracking-[-0.03em]"
      >
        {item.itemName}
      </button>

      <button
        type="button"
        className="w-[18px] h-[18px] rounded-full border border-[#c9c9c9] flex items-center justify-center text-[13px] leading-none text-[#9a9a9a]"
      >
        ›
      </button>

      {item.mealLogItemId && (
        <button
          type="button"
          onClick={() => onOpenDelete(item)}
          className="ml-[12px] w-[18px] h-[18px] rounded-[4px] border border-[#ff9b67] flex items-center justify-center text-[12px] leading-none text-[#ff9b67]"
        >
          x
        </button>
      )}
    </div>
  );
}

function DeleteModal({ isDeleting, onClose, onDelete }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="relative w-[280px] rounded-[8px] bg-white px-[28px] pt-[30px] pb-[26px]">
        <button
          type="button"
          onClick={onClose}
          className="absolute left-[24px] top-[22px] text-[20px] font-light text-[#272932]"
        >
          x
        </button>

        <p className="text-center text-[16px] font-bold text-[#272932] tracking-[-0.03em]">
          식단에서 제외하시겠습니까?
        </p>

        <p className="mt-[42px] text-center text-[13px] font-normal text-[#272932] tracking-[-0.03em]">
          제외된 항목은 홈 요약 계산에서 빠집니다.
        </p>

        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="mt-[34px] h-[40px] w-full rounded-[7px] bg-[#272932] text-[13px] font-bold text-white tracking-[-0.02em] disabled:opacity-50"
        >
          {isDeleting ? "제외 중..." : "제외"}
        </button>
      </div>
    </div>
  );
}

export default function MealDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mealKey = "breakfast" } = useParams();

  const initialMeal = useMemo(
    () => location.state?.meal ?? emptyMeal(mealKey),
    [location.state, mealKey]
  );

  const [meal, setMeal] = useState(initialMeal);
  const [pendingDeleteItem, setPendingDeleteItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadMealDetail() {
      if (!initialMeal.mealLogId) return;

      try {
        const response = await getMealLog(initialMeal.mealLogId);
        if (!ignore) setMeal(toMealDisplay(response, mealKey));
      } catch (loadError) {
        if (!ignore) {
          setError(loadError.message || "식단 상세를 불러오지 못했습니다.");
        }
      }
    }

    loadMealDetail();

    return () => {
      ignore = true;
    };
  }, [initialMeal.mealLogId, mealKey]);

  const title = `${meal.label ?? "식단"} 영양`;
  const foodItems =
    meal.items?.length > 0
      ? meal.items
      : (meal.foods ?? []).map((food, index) => ({
          mealLogItemId: null,
          itemName: food,
          fallbackKey: `${food}-${index}`,
        }));

  const handleDelete = async () => {
    if (!meal.mealLogId || !pendingDeleteItem?.mealLogItemId) {
      setPendingDeleteItem(null);
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      const response = await setMealLogItemExcluded({
        mealLogId: meal.mealLogId,
        mealLogItemId: pendingDeleteItem.mealLogItemId,
        excluded: true,
      });

      setMeal(toMealDisplay(response, mealKey));
      setPendingDeleteItem(null);
    } catch (deleteError) {
      setError(deleteError.message || "식단 항목을 제외하지 못했습니다.");
    } finally {
      setIsDeleting(false);
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
        <h1 className="text-[28px] font-extrabold text-[#272932] tracking-[-0.05em]">
          {title}
        </h1>

        {error && (
          <p className="mt-[12px] text-[12px] font-light text-[#ff5b5b]">
            {error}
          </p>
        )}

        <div className="mt-[28px]">
          <div className="h-[56px] rounded-[13px] border border-[#d7d2d2] px-[22px] flex items-center justify-between">
            <span className="text-[13px] font-bold text-[#272932] tracking-[-0.02em]">
              총 열량
            </span>

            <span className="text-[13px] font-bold text-[#69a80f] tracking-[-0.02em]">
              {meal.kcal ?? 0} kal
            </span>
          </div>

          <div className="mt-[12px] grid grid-cols-3 gap-[12px]">
            <NutritionSummaryBox label="탄수화물" value={meal.carbs ?? 0} />
            <NutritionSummaryBox label="단백질" value={meal.protein ?? 0} />
            <NutritionSummaryBox label="지방" value={meal.fat ?? 0} />
          </div>
        </div>

        <section className="mt-[34px]">
          <h2 className="text-[20px] font-extrabold text-[#272932] tracking-[-0.04em]">
            {meal.label ?? "식단"} 식단
          </h2>

          <div className="mt-[22px] space-y-[4px]">
            {foodItems.length > 0 ? (
              foodItems.map((item) => (
                <FoodRow
                  key={item.mealLogItemId ?? item.fallbackKey}
                  item={item}
                  onOpenDelete={setPendingDeleteItem}
                />
              ))
            ) : (
              <p className="text-[13px] font-light text-[#8a8c90]">
                아직 추가된 음식이 없습니다.
              </p>
            )}
          </div>
        </section>
      </main>

      {pendingDeleteItem && (
        <DeleteModal
          isDeleting={isDeleting}
          onClose={() => setPendingDeleteItem(null)}
          onDelete={handleDelete}
        />
      )}
    </MobileLayout>
  );
}
