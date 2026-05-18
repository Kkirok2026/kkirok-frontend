import { useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import KkirokLogo from "../components/common/KkirokLogo";
import BottomButton from "../components/common/BottomButton";
import { createCustomFood } from "../api/foodApi";
import {
  addFoodItems,
  createMealLog,
  getMealLogsByDate,
} from "../api/mealLogApi";
import {
  MEAL_TYPE_TO_KEY,
  formatDateKey,
  toMealDisplay,
} from "../utils/mealData";

const INPUT_TEXT_STYLE = {
  fontSize: "12.5px",
  lineHeight: "15px",
  fontWeight: 300,
};

function cleanDecimal(value) {
  return `${value ?? ""}`.replace(/[^\d.]/g, "");
}

function formNumber(value, fallback = null) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

async function ensureMealLog({ mealLogId, date, mealType }) {
  if (mealLogId) return Number(mealLogId);

  try {
    const created = await createMealLog({
      logDate: date,
      mealType,
      memo: "직접 입력 식단",
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

function MealInput({
  placeholder,
  value,
  onChange,
  inputMode = "decimal",
  bordered = false,
}) {
  return (
    <input
      type="text"
      inputMode={inputMode}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      style={INPUT_TEXT_STYLE}
      className={[
        "h-[42px] w-full rounded-[10px] px-[36px] outline-none",
        "border border-transparent bg-[#f8f8f8]",
        "text-[#272932] caret-[#272932]",
        "placeholder:text-[#a9a9a9]",
      ].join(" ")}
    />
  );
}

export default function CreateMealPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const initialName =
    location.state?.query ||
    searchParams.get("q") ||
    searchParams.get("foodName") ||
    "";

  const [foodName, setFoodName] = useState(initialName);
  const [caloriesKcal, setCaloriesKcal] = useState("");
  const [carbG, setCarbG] = useState("");
  const [proteinG, setProteinG] = useState("");
  const [fatG, setFatG] = useState("");
  const [cholesterolMg, setCholesterolMg] = useState("");
  const [sugarG, setSugarG] = useState("");
  const [sodiumMg, setSodiumMg] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const date = searchParams.get("date") || formatDateKey(new Date());
  const mealType = searchParams.get("mealType") || "LUNCH";
  const mealLogId = searchParams.get("mealLogId");

  const canSubmit = useMemo(() => {
    return (
      foodName.trim().length > 0 &&
      caloriesKcal.trim().length > 0 &&
      carbG.trim().length > 0 &&
      proteinG.trim().length > 0 &&
      fatG.trim().length > 0
    );
  }, [caloriesKcal, carbG, fatG, foodName, proteinG]);

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) {
        setError("메뉴명, 칼로리, 탄수화물, 단백질, 지방은 꼭 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const food = await createCustomFood({
        foodName: foodName.trim(),
        amountG: 100,
        caloriesKcal: Math.round(
          formNumber(carbG, 0) * 4 +
            formNumber(proteinG, 0) * 4 +
            formNumber(fatG, 0) * 9
        ),
        carbG: formNumber(carbG, 0),
        proteinG: formNumber(proteinG, 0),
        fatG: formNumber(fatG, 0),
        sugarG: sugarG.trim() ? formNumber(sugarG, 0) : null,
        sodiumMg: sodiumMg.trim() ? formNumber(sodiumMg, 0) : null,
      });

      const foodId = food?.foodId;

      if (!foodId) {
        throw new Error("직접 입력한 음식 ID를 확인하지 못했습니다.");
      }

      if (!searchParams.get("mealType")) {
        navigate(`/foods/${foodId}`, { replace: true, state: { food } });
        return;
      }

      const targetMealLogId = await ensureMealLog({ mealLogId, date, mealType });
      const updatedMeal = await addFoodItems(targetMealLogId, [{ foodId }]);
      const meal = toMealDisplay(updatedMeal);
      const mealKey = meal.mealKey || MEAL_TYPE_TO_KEY[mealType] || "lunch";

      navigate(`/meal-details/${mealKey}`, {
        replace: true,
        state: { meal, date },
      });
    } catch (submitError) {
      if (submitError.status === 401) {
        navigate("/login", { replace: true });
        return;
      }

      setError(submitError.message || "직접 식단을 추가하지 못했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileLayout>
      <header className="absolute left-0 right-0 top-[66px] flex flex-col items-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-[50px] top-[0px] h-[28px] rounded-[7px] bg-transparent text-[11px] font-light text-[#272932] flex items-center gap-[7px]"
        >
          <span className="flex h-[24px] w-[24px] items-center justify-center rounded-[7px] bg-[#f8f8f8] text-[18px] leading-none">
            ‹
          </span>
          취소
        </button>

        <p className="text-[15px] leading-[18px] font-normal text-[#272932] tracking-[-0.02em]">
          Create Meal
        </p>

        <KkirokLogo className="mt-[2px]" />
      </header>

      <main className="absolute left-[50px] right-[50px] top-[190px]">
      <MealInput
  placeholder="메뉴 명"
  value={foodName}
  onChange={(value) => {
    setFoodName(value);
    setError("");
  }}
  inputMode="text"
/>

        <div className="mt-[20px] space-y-[18px]">
          <MealInput
            placeholder="탄수화물 (g)"
            value={carbG}
            onChange={(value) => {
              setCarbG(cleanDecimal(value));
              setError("");
            }}
          />

          <MealInput
            placeholder="단백질 (g)"
            value={proteinG}
            onChange={(value) => {
              setProteinG(cleanDecimal(value));
              setError("");
            }}
          />

          <MealInput
            placeholder="나트륨 (mg)"
            value={sodiumMg}
            onChange={(value) => {
              setSodiumMg(cleanDecimal(value));
              setError("");
            }}
          />

          <MealInput
            placeholder="지방 (g)"
            value={fatG}
            onChange={(value) => {
              setFatG(cleanDecimal(value));
              setError("");
            }}
          />

          <MealInput
            placeholder="콜레스테롤 (g)"
            value={cholesterolMg}
            onChange={(value) => {
              setCholesterolMg(cleanDecimal(value));
              setError("");
            }}
          />

          <MealInput
            placeholder="당 (g)"
            value={sugarG}
            onChange={(value) => {
              setSugarG(cleanDecimal(value));
              setError("");
            }}
          />
        </div>

        {error && (
          <p className="mt-[12px] text-center text-[11px] font-light text-[#ff5b5b]">
            {error}
          </p>
        )}
      </main>

      <BottomButton
        onClick={handleSubmit}
        disabled={isSubmitting}
        bottomClassName="bottom-[70px]"
        className="!h-[50px] !left-[50px] !right-[50px] !rounded-[10px] !text-[13px] !font-bold"
      >
        {isSubmitting ? "추가 중..." : "다음"}
      </BottomButton>
    </MobileLayout>
  );
}