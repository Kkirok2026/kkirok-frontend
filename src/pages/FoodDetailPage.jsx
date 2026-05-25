import { useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import KkirokLogo from "../components/common/KkirokLogo";

import { getFood, updateFoodCalories } from "../api/foodApi";
import {
  addFoodItems,
  createMealLog,
  getMealLogsByDate,
  updateMealLogItemAmount,
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

function toOptionalPositiveNumber(value) {
  if (`${value || ""}`.trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : NaN;
}

function cleanDecimal(value) {
  const onlyNumber = `${value ?? ""}`.replace(/[^\d.]/g, "");
  const [head, ...tail] = onlyNumber.split(".");

  if (tail.length === 0) return head;
  return `${head}.${tail.join("")}`;
}

function formatGramValue(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "-";
  return `${toRounded(number)}g`;
}

function WeightInfoRow({
  label,
  amount,
  calories,
  isEditing = false,
  draftValue = "",
  onStartEdit,
  onChangeDraft,
  onSave,
  onCancel,
  disabled = false,
}) {
  return (
    <div className="flex items-center justify-between rounded-[8px] bg-[#f8f8f8] px-[12px] py-[10px]">
      <div>
        <p className="text-[11px] font-bold leading-none text-[#272932] tracking-[-0.03em]">
          {label}
        </p>
        <p className="mt-[5px] text-[10px] font-light leading-none text-[#8a8c90] tracking-[-0.02em]">
          {formatGramValue(amount)}
        </p>
      </div>
      {isEditing ? (
        <div className="flex items-center gap-[3px]">
          <input
            type="text"
            inputMode="decimal"
            value={draftValue}
            onChange={(event) => onChangeDraft(cleanDecimal(event.target.value))}
            onBlur={onSave}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.currentTarget.blur();
              }
              if (event.key === "Escape") {
                onCancel();
              }
            }}
            autoFocus
            className="h-[18px] w-[50px] bg-transparent text-right text-[12px] font-bold leading-none text-[#69a80f] outline-none tracking-[-0.02em]"
          />
          <span className="text-[12px] font-bold leading-none text-[#69a80f] tracking-[-0.02em]">
            kcal
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={onStartEdit}
          disabled={disabled}
          className="text-[12px] font-bold leading-none text-[#69a80f] tracking-[-0.02em] disabled:cursor-default"
        >
          {toRounded(calories)} kcal
        </button>
      )}
    </div>
  );
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
  const queryMealLogItemId = searchParams.get("mealLogItemId");
  const date = searchParams.get("date") || formatDateKey(new Date());
  const isMealAddFlow = searchParams.get("source") === "meal-add";

  const [food, setFood] = useState(location.state?.food ?? null);
  const [isLoading, setIsLoading] = useState(Boolean(foodId));
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [amountG, setAmountG] = useState(
    location.state?.food?.amountG ? String(location.state.food.amountG) : ""
  );
  const [amountMessage, setAmountMessage] = useState("");
  const [editingCalorieKey, setEditingCalorieKey] = useState("");
  const [calorieDraft, setCalorieDraft] = useState("");
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
  const mealLogItemId = queryMealLogItemId || location.state?.mealLogItemId;

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
        if (!ignore) {
          const fallbackFood = location.state?.food;
          setFood(
            isOpenedFromMealDetail && fallbackFood?.nutrients
              ? {
                  ...response,
                  amountG: fallbackFood.amountG,
                  nutrients: fallbackFood.nutrients,
                }
              : response
          );
        }
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
  }, [foodId, hasValidFoodId, isOpenedFromMealDetail, location.state?.food, routeFoodName]);

  const flatFoodData = useMemo(() => {
    const totals = food?.nutrients ?? {};

    return {
      ...food,
      ...totals,
    };
  }, [food]);

  const basisNutrients = food?.nutritionBasisNutrients ?? food?.nutrients ?? {};
  const totalWeightNutrients = food?.totalWeightNutrients ?? food?.nutrients ?? {};

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

  const beginCalorieEdit = (key, value) => {
    if (!hasValidFoodId) return;
    const number = Number(value);
    setEditingCalorieKey(key);
    setCalorieDraft(Number.isFinite(number) ? `${toRounded(number)}` : "");
    setError("");
  };

  const cancelCalorieEdit = () => {
    setEditingCalorieKey("");
    setCalorieDraft("");
  };

  const saveCalorieEdit = async () => {
    if (!editingCalorieKey || !hasValidFoodId || isAdding) return;

    const value = Number(calorieDraft);
    if (!Number.isFinite(value) || value < 0) {
      setError("칼로리는 0 이상의 숫자로 입력해 주세요.");
      cancelCalorieEdit();
      return;
    }

    setIsAdding(true);
    setError("");

    try {
      const response = await updateFoodCalories(numericFoodId, {
        basisCaloriesKcal:
          editingCalorieKey === "basis" ? value : undefined,
        totalCaloriesKcal:
          editingCalorieKey === "total" ? value : undefined,
      });

      setFood((prev) => ({
        ...prev,
        ...response,
        amountG: prev?.amountG,
        nutrients:
          isOpenedFromMealDetail && prev?.nutrients
            ? prev.nutrients
            : response.nutrients,
      }));
    } catch (updateError) {
      if (updateError.status === 401) {
        navigate("/login", { replace: true });
        return;
      }
      setError(updateError.message || "칼로리를 수정하지 못했습니다.");
    } finally {
      setIsAdding(false);
      cancelCalorieEdit();
    }
  };

  const addFoodToMeal = async (targetMealType) => {
    if (!hasValidFoodId || isAdding) return;

    const servingAmount = toOptionalPositiveNumber(amountG);
    if (Number.isNaN(servingAmount)) {
      setError("먹은 양은 0보다 큰 숫자로 입력해 주세요.");
      return;
    }

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

      await addFoodItems(targetMealLogId, [
        {
          foodId: numericFoodId,
          amountG: servingAmount ?? undefined,
        },
      ]);

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

  const handleUpdateAmount = async () => {
    if (!queryMealLogId || !mealLogItemId || isAdding) return;

    const servingAmount = toOptionalPositiveNumber(amountG);
    if (!servingAmount || Number.isNaN(servingAmount)) {
      setError("먹은 양은 0보다 큰 숫자로 입력해 주세요.");
      return;
    }

    setIsAdding(true);
    setError("");
    setAmountMessage("");

    try {
      const response = await updateMealLogItemAmount({
        mealLogId: queryMealLogId,
        mealLogItemId,
        amountG: servingAmount,
      });
      const updatedItem = response?.items?.find(
        (item) => String(item.mealLogItemId) === String(mealLogItemId)
      );

      if (updatedItem) {
        setFood((prev) => ({
          ...prev,
          amountG: updatedItem.amountG,
          nutrients: updatedItem.nutrients,
          defaultServingG: updatedItem.amountG,
        }));
        setAmountG(String(updatedItem.amountG));
      }
      setAmountMessage("먹은 양을 수정했습니다.");
    } catch (updateError) {
      if (updateError.status === 401) {
        navigate("/login", { replace: true });
        return;
      }
      setError(updateError.message || "먹은 양을 수정하지 못했습니다.");
    } finally {
      setIsAdding(false);
    }
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

        <main className="absolute left-[58px] right-[58px] top-[166px] bottom-[142px] overflow-y-auto pb-[20px]">
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

              <div className="mt-[18px] space-y-[8px]">
                <WeightInfoRow
                  label="영양성분함량 기준량"
                  amount={food?.nutritionBasisAmountG ?? food?.defaultServingG}
                  calories={basisNutrients.caloriesKcal}
                  isEditing={editingCalorieKey === "basis"}
                  draftValue={calorieDraft}
                  onStartEdit={() =>
                    beginCalorieEdit("basis", basisNutrients.caloriesKcal)
                  }
                  onChangeDraft={setCalorieDraft}
                  onSave={saveCalorieEdit}
                  onCancel={cancelCalorieEdit}
                  disabled={!hasValidFoodId || isAdding}
                />
                <WeightInfoRow
                  label="총 식품 중량"
                  amount={food?.totalWeightG ?? food?.defaultServingG}
                  calories={totalWeightNutrients.caloriesKcal}
                  isEditing={editingCalorieKey === "total"}
                  draftValue={calorieDraft}
                  onStartEdit={() =>
                    beginCalorieEdit("total", totalWeightNutrients.caloriesKcal)
                  }
                  onChangeDraft={setCalorieDraft}
                  onSave={saveCalorieEdit}
                  onCancel={cancelCalorieEdit}
                  disabled={!hasValidFoodId || isAdding}
                />
              </div>

              {(shouldShowAddButton || isOpenedFromMealDetail) && (
                <div className="mt-[18px]">
                  <label className="block text-[11px] font-bold text-[#272932] tracking-[-0.03em]">
                    먹은 양
                  </label>
                  <div className="mt-[8px] flex items-center gap-[8px]">
                    <input
                      type="number"
                      min="0"
                      inputMode="decimal"
                      value={amountG}
                      onChange={(event) => {
                        setAmountG(event.target.value);
                        setAmountMessage("");
                      }}
                      placeholder={formatGramValue(food?.totalWeightG ?? food?.defaultServingG)}
                      className="h-[38px] flex-1 rounded-[8px] border border-[#dedede] px-[12px] text-[13px] font-medium text-[#272932] outline-none focus:border-[#9bb314]"
                    />
                    <span className="text-[12px] font-bold text-[#6f7075]">
                      g
                    </span>
                  </div>
                  <p className="mt-[6px] text-[10px] font-light leading-[1.4] text-[#8a8c90]">
                    {shouldShowAddButton
                      ? "입력하지 않으면 총 식품 중량 기준으로 추가됩니다."
                      : "수정하면 이 양만큼의 칼로리로 다시 계산됩니다."}
                  </p>
                  {amountMessage && (
                    <p className="mt-[6px] text-[10px] font-light text-[#69a80f]">
                      {amountMessage}
                    </p>
                  )}
                </div>
              )}

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
              bottom: "106px",
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

        {isOpenedFromMealDetail && queryMealLogId && mealLogItemId && (
          <div
            className="absolute left-1/2 z-30 -translate-x-1/2"
            style={{
              bottom: "106px",
              width: "300px",
            }}
          >
            <button
              type="button"
              disabled={!food || isAdding}
              onClick={handleUpdateAmount}
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
              {isAdding ? "수정 중..." : "먹은 양 수정"}
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
