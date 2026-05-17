import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import KkirokLogo from "../components/common/KkirokLogo";

const MEAL_LABELS = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
  snack: "간식",
};

const DEFAULT_MEAL_DATA = {
  breakfast: {
    label: "아침",
    kcal: 760,
    carbs: 760,
    protein: 760,
    fat: 760,
    foods: ["감자샐러드", "자두에이드"],
  },
  lunch: {
    label: "점심",
    kcal: 1260,
    carbs: 280,
    protein: 75,
    fat: 80,
    foods: ["감자샐러드", "자두에이드"],
  },
  dinner: {
    label: "저녁",
    kcal: 860,
    carbs: 80,
    protein: 80,
    fat: 80,
    foods: ["감자샐러드", "자두에이드"],
  },
  snack: {
    label: "간식",
    kcal: 76,
    carbs: 80,
    protein: 80,
    fat: 80,
    foods: ["감자샐러드", "자두에이드"],
  },
};

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

function FoodRow({ name, onOpenDelete }) {
  return (
    <div className="h-[34px] flex items-center">
      <button
        type="button"
        className="flex-1 text-left text-[17px] font-normal text-[#272932] tracking-[-0.03em]"
      >
        {name}
      </button>

      <button
        type="button"
        className="w-[18px] h-[18px] rounded-full border border-[#c9c9c9] flex items-center justify-center text-[13px] leading-none text-[#9a9a9a]"
      >
        ›
      </button>

      <button
        type="button"
        onClick={onOpenDelete}
        className="ml-[12px] w-[18px] h-[18px] rounded-[4px] border border-[#ff9b67] flex items-center justify-center text-[12px] leading-none text-[#ff9b67]"
      >
        ×
      </button>
    </div>
  );
}

function DeleteModal({ onClose, onDelete }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="relative w-[280px] rounded-[8px] bg-white px-[28px] pt-[30px] pb-[26px]">
        <button
          type="button"
          onClick={onClose}
          className="absolute left-[24px] top-[22px] text-[20px] font-light text-[#272932]"
        >
          ×
        </button>

        <p className="text-center text-[16px] font-bold text-[#272932] tracking-[-0.03em]">
          식단에서 제외하시겠습니까?
        </p>

        <p className="mt-[42px] text-center text-[13px] font-normal text-[#272932] tracking-[-0.03em]">
          삭제된 식단은 다시 불러올 수 없습니다.
        </p>

        <button
          type="button"
          onClick={onDelete}
          className="mt-[34px] h-[40px] w-full rounded-[7px] bg-[#272932] text-[13px] font-bold text-white tracking-[-0.02em]"
        >
          삭제
        </button>
      </div>
    </div>
  );
}

export default function MealDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mealKey = "breakfast" } = useParams();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const meal = useMemo(() => {
    const stateMeal = location.state?.meal;

    if (stateMeal) {
      return {
        ...DEFAULT_MEAL_DATA[mealKey],
        ...stateMeal,
        foods: stateMeal.foods ?? DEFAULT_MEAL_DATA[mealKey]?.foods ?? [],
      };
    }

    return DEFAULT_MEAL_DATA[mealKey] ?? DEFAULT_MEAL_DATA.breakfast;
  }, [location.state, mealKey]);

  const title = `${MEAL_LABELS[mealKey] ?? meal.label ?? "아침"} 영양`;

  const handleDelete = () => {
    setIsDeleteModalOpen(false);
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
            {MEAL_LABELS[mealKey] ?? meal.label ?? "아침"} 식단
          </h2>

          <div className="mt-[22px] space-y-[4px]">
            {(meal.foods ?? []).map((food) => (
              <FoodRow
                key={food}
                name={food}
                onOpenDelete={() => setIsDeleteModalOpen(true)}
              />
            ))}
          </div>
        </section>
      </main>

      {isDeleteModalOpen && (
        <DeleteModal
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={handleDelete}
        />
      )}
    </MobileLayout>
  );
}