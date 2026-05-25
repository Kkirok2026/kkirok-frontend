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
  toMealsByType,
} from "../utils/mealData";

import CarbsIcon from "../assets/icons/Carbs.png";
import ProteinIcon from "../assets/icons/Protein.png";
import FatIcon from "../assets/icons/Fat.png";
import SodiumIcon from "../assets/icons/Sodium.png";

const INPUT_TEXT_STYLE = {
  fontSize: "11.5px",
  lineHeight: "14px",
  fontWeight: 300,
};

const MEAL_OPTIONS = [
  { mealType: "BREAKFAST", mealKey: "breakfast", label: "아침" },
  { mealType: "LUNCH", mealKey: "lunch", label: "점심" },
  { mealType: "DINNER", mealKey: "dinner", label: "저녁" },
  { mealType: "SNACK", mealKey: "snack", label: "간식" },
];

const PREVIEW_META = {
  carbG: {
    label: "탄수화물",
    unit: "g",
    icon: CarbsIcon,
  },
  proteinG: {
    label: "단백질",
    unit: "g",
    icon: ProteinIcon,
  },
  fatG: {
    label: "지방",
    unit: "g",
    icon: FatIcon,
  },
  amountG: {
    label: "1회 제공량/1인분",
    unit: "g",
    icon: SodiumIcon,
  },
};

function cleanDecimal(value) {
  const onlyNumber = `${value ?? ""}`.replace(/[^\d.]/g, "");
  const [head, ...tail] = onlyNumber.split(".");

  if (tail.length === 0) return head;
  return `${head}.${tail.join("")}`;
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toOptionalNumber(value) {
  if (`${value ?? ""}`.trim() === "") return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return "";
  if (Number.isInteger(number)) return `${number}`;

  return `${Math.round(number * 10) / 10}`;
}

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
      memo: "직접 입력 식단",
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

function MealInput({ placeholder, value, onChange, inputMode = "decimal" }) {
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

function ReadOnlyMealInput({ value, placeholder }) {
  return (
    <div
      style={INPUT_TEXT_STYLE}
      className={[
        "flex h-[42px] w-full items-center rounded-[10px] px-[36px]",
        "border border-transparent bg-[#f8f8f8]",
        value ? "text-[#272932]" : "text-[#a9a9a9]",
      ].join(" ")}
    >
      {value || placeholder}
    </div>
  );
}

function PreviewCard({ item }) {
  return (
    <div className="w-[68px]">
      <div className="flex h-[68px] items-center justify-center rounded-[9px] bg-[#f8f8f8]">
        <img
          src={item.icon}
          alt={item.label}
          className="max-h-[48px] max-w-[48px] object-contain"
        />
      </div>

      <p className="mt-[8px] text-[11px] font-bold leading-none text-[#272932] tracking-[-0.02em]">
        {item.label}
      </p>

      <p className="mt-[7px] text-[10px] font-light leading-none text-[#6f7075] tracking-[-0.02em]">
        {item.value}
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

export default function CreateMealPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const initialName =
    location.state?.query ||
    searchParams.get("q") ||
    searchParams.get("foodName") ||
    "직접 입력 메뉴";

  const date = searchParams.get("date") || formatDateKey(new Date());
  const queryMealType = searchParams.get("mealType");
  const queryMealLogId = searchParams.get("mealLogId");
  const hasFixedMealTarget =
    searchParams.get("source") === "meal-add" && Boolean(queryMealType);

  const [step, setStep] = useState("form");
  const [carbG, setCarbG] = useState("");
  const [proteinG, setProteinG] = useState("");
  const [fatG, setFatG] = useState("");
  const [amountG, setAmountG] = useState("");
  const [basisCaloriesKcal, setBasisCaloriesKcal] = useState("");
  const [totalCaloriesKcal, setTotalCaloriesKcal] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState(
    queryMealType || "DINNER"
  );

  const isCarbEntered = carbG.trim().length > 0;
  const isProteinEntered = proteinG.trim().length > 0;
  const isFatEntered = fatG.trim().length > 0;
  const canCalculateCalories = isCarbEntered && isProteinEntered && isFatEntered;

  const calculatedCalories = useMemo(() => {
    if (!canCalculateCalories) return null;

    return Math.round(
      toNumber(carbG) * 4 + toNumber(proteinG) * 4 + toNumber(fatG) * 9
    );
  }, [canCalculateCalories, carbG, fatG, proteinG]);

  const previewItems = useMemo(() => {
    const items = [];
  
    if (isCarbEntered) {
      items.push({
        ...PREVIEW_META.carbG,
        key: "carbG",
        value: `${formatNumber(carbG)}g`,
      });
    }
  
    if (isProteinEntered) {
      items.push({
        ...PREVIEW_META.proteinG,
        key: "proteinG",
        value: `${formatNumber(proteinG)}g`,
      });
    }
  
    if (isFatEntered) {
      items.push({
        ...PREVIEW_META.fatG,
        key: "fatG",
        value: `${formatNumber(fatG)}g`,
      });
    }
  
    return items;
  }, [
    carbG,
    fatG,
    isCarbEntered,
    isFatEntered,
    isProteinEntered,
    proteinG,
  ]);

  const createAndAddFood = async (targetMealType) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const totalWeight = toOptionalNumber(amountG);
      const basisCalories = toOptionalNumber(basisCaloriesKcal);
      const totalCalories = toOptionalNumber(totalCaloriesKcal);
      const food = await createCustomFood({
        foodName: initialName.trim() || "직접 입력 메뉴",
        amountG: 100,
        totalWeightG: totalWeight ?? undefined,
        basisCaloriesKcal: basisCalories ?? undefined,
        totalCaloriesKcal: totalCalories ?? undefined,
        caloriesKcal:
          basisCalories === null && totalCalories === null
            ? calculatedCalories ?? undefined
            : undefined,
        carbG: toNumber(carbG, 0),
        proteinG: toNumber(proteinG, 0),
        fatG: toNumber(fatG, 0),
      });

      const foodId = food?.foodId;

      if (!foodId) {
        throw new Error("직접 입력한 음식 ID를 확인하지 못했습니다.");
      }

      const targetMealLogId = await ensureMealLog({
        mealLogId:
          hasFixedMealTarget && queryMealType === targetMealType
            ? queryMealLogId
            : null,
        date,
        mealType: targetMealType,
      });

      await addFoodItems(targetMealLogId, [
        {
          foodId,
          amountG: totalWeight ?? undefined,
        },
      ]);

      const refreshedMealLogs = await getMealLogsByDate(date);
      const meals = toMealsByType(refreshedMealLogs);
      const mealKey = MEAL_TYPE_TO_KEY[targetMealType] || "lunch";
      const meal = meals[mealKey] || toMealDisplay(refreshedMealLogs);

      setIsMealModalOpen(false);

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

  const handleNext = () => {
    setError("");
    setStep("detail");
  };

  const handleAddButton = () => {
    if (hasFixedMealTarget) {
      createAndAddFood(queryMealType);
      return;
    }

    setSelectedMealType("DINNER");
    setIsMealModalOpen(true);
  };

  const handleConfirmMealType = () => {
    createAndAddFood(selectedMealType);
  };

  const handleBack = () => {
    if (step === "detail") {
      setStep("form");
      setError("");
      return;
    }

    navigate(-1);
  };

  return (
    <MobileLayout>
      <header className="absolute left-0 right-0 top-[66px] flex flex-col items-center">
      <button
  type="button"
  onClick={handleBack}
  className="absolute left-[50px] top-[0px] flex h-[28px] items-center gap-[7px] rounded-[7px] bg-transparent text-[11px] font-light text-[#272932]"
>
  <span className="flex h-[24px] w-[24px] items-center justify-center rounded-[7px] bg-[#f8f8f8] text-[18px] leading-none">
    ‹
  </span>
  {step === "form" ? "취소" : ""}
</button>

        <p className="text-[15px] leading-[18px] font-normal text-[#272932] tracking-[-0.02em]">
          {step === "form" ? "Create Meal" : "Meal details"}
        </p>

        <KkirokLogo className="mt-[2px]" />
      </header>

      {step === "form" ? (
        <main className="absolute left-[50px] right-[50px] top-[190px]">
          <div className="mb-[20px] rounded-[10px] bg-[#f8f8f8] px-[36px] py-[13px] text-[12.5px] font-light leading-[15px] text-[#272932]">
            {initialName}
          </div>

          <div className="space-y-[18px]">
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
              placeholder="지방 (g)"
              value={fatG}
              onChange={(value) => {
                setFatG(cleanDecimal(value));
                setError("");
              }}
            />

            <ReadOnlyMealInput
              value={
                calculatedCalories !== null ? `${calculatedCalories} kcal` : ""
              }
              placeholder="칼로리 (kcal) - 탄·단·지가 입력되면 자동 계산됩니다"
            />

            <MealInput
              placeholder="100g당 칼로리 (kcal)"
              value={basisCaloriesKcal}
              onChange={(value) => {
                setBasisCaloriesKcal(cleanDecimal(value));
                setError("");
              }}
            />

            <MealInput
              placeholder="식품 중량별 칼로리 (kcal)"
              value={totalCaloriesKcal}
              onChange={(value) => {
                setTotalCaloriesKcal(cleanDecimal(value));
                setError("");
              }}
            />

            <MealInput
              placeholder="총 식품 중량 (g)"
              value={amountG}
              onChange={(value) => {
                setAmountG(cleanDecimal(value));
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
      ) : (
        <main className="absolute left-[58px] right-[58px] top-[166px]">
          <h1
            className="text-[22px] leading-[1.25] text-[#272932] tracking-[-0.05em]"
            style={{ fontWeight: 650 }}
          >
            ‘{initialName}’ 메뉴 추가 완료
          </h1>

          {calculatedCalories !== null && (
            <p className="mt-[24px] text-[14px] font-bold leading-none text-[#272932] tracking-[-0.03em]">
              {calculatedCalories} kcal
            </p>
          )}

          {previewItems.length > 0 ? (
            <div className="mt-[30px] grid grid-cols-4 gap-x-[14px] gap-y-[34px]">
              {previewItems.map((item) => (
                <PreviewCard key={item.key} item={item} />
              ))}
            </div>
          ) : (
            <p className="mt-[30px] text-[12px] font-light text-[#8a8c90]">
              입력한 영양 정보가 없습니다.
            </p>
          )}

          {error && (
            <p className="mt-[26px] text-[12px] font-light text-[#ff5b5b]">
              {error}
            </p>
          )}
        </main>
      )}

      <BottomButton
        onClick={step === "form" ? handleNext : handleAddButton}
        disabled={isSubmitting}
        bottomClassName="bottom-[106px]"
        className="!left-[50px] !right-[50px] !h-[50px] !rounded-[10px] !text-[13px] !font-bold"
      >
        {step === "form" ? "다음" : isSubmitting ? "추가 중..." : "식단에 추가"}
      </BottomButton>

      {isMealModalOpen && (
        <MealSelectModal
          selectedMealType={selectedMealType}
          onSelectMealType={setSelectedMealType}
          onClose={() => setIsMealModalOpen(false)}
          onConfirm={handleConfirmMealType}
          isAdding={isSubmitting}
        />
      )}
    </MobileLayout>
  );
}
