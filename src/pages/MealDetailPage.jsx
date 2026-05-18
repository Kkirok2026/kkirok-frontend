import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import KkirokLogo from "../components/common/KkirokLogo";
import { getMealLog, setMealLogItemExcluded } from "../api/mealLogApi";
import {
  MEAL_KEY_TO_TYPE,
  MEAL_LABELS as API_MEAL_LABELS,
  formatDateKey,
  toMealDisplay,
} from "../utils/mealData";

import ArrowIcon from "../assets/icons/Icon-Arrow.svg";
import CloseSquareIcon from "../assets/icons/Close-Square.svg";

const LOCAL_MEAL_LABELS = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
  snack: "간식",
};

function getMealLabel({ mealKey, mealType, label }) {
  return (
    label ||
    API_MEAL_LABELS[mealType] ||
    LOCAL_MEAL_LABELS[mealKey] ||
    "식단"
  );
}

function emptyMeal(mealKey) {
  const mealType = MEAL_KEY_TO_TYPE[mealKey] || "BREAKFAST";

  return {
    mealKey,
    mealType,
    label: getMealLabel({ mealKey, mealType }),
    kcal: 0,
    carbs: 0,
    protein: 0,
    fat: 0,
    foods: [],
    items: [],
  };
}

function fallbackMeal(mealKey) {
  return emptyMeal(mealKey);
}

function NutritionSummaryBox({ label, value, unit = "g", wide = false }) {
  return (
    <div
      className={[
        "h-[50px] rounded-[13px] border border-[#d7d2d2]",
        "flex items-center",
        wide
          ? "justify-between px-[24px]"
          : "justify-center gap-[10px] px-[10px]",
      ].join(" ")}
    >
      <span className="whitespace-nowrap text-[12px] font-bold text-[#272932] tracking-[-0.03em]">
        {label}
      </span>

      <span className="whitespace-nowrap text-[12px] font-bold text-[#69a80f] tracking-[-0.03em]">
        {value} {unit}
      </span>
    </div>
  );
}

function getFoodName(item) {
  if (typeof item === "string") return item;

  return (
    item.itemName ||
    item.foodName ||
    item.name ||
    item.food?.foodName ||
    item.food?.name ||
    "음식"
  );
}

function getFoodId(item) {
  if (!item || typeof item === "string") return null;

  return item.foodId || item.food?.foodId || item.food?.id || item.id || null;
}

function normalizeFoodItem(item, index) {
  if (typeof item === "string") {
    return {
      itemName: item,
      foodId: null,
      mealLogItemId: null,
      fallbackKey: `${item}-${index}`,
    };
  }

  const itemName = getFoodName(item);

  return {
    ...item,
    itemName,
    foodId: getFoodId(item),
    mealLogItemId: item.mealLogItemId || null,
    fallbackKey:
      item.mealLogItemId ||
      item.foodId ||
      item.id ||
      `${itemName}-${index}`,
  };
}

function FoodRow({ item, onOpenDetail, onOpenDelete }) {
  return (
    <div className="flex h-[34px] items-center">
      <span className="flex-1 text-left text-[17px] font-normal text-[#272932] tracking-[-0.03em]">
        {item.itemName}
      </span>

      <button
        type="button"
        onClick={() => onOpenDetail(item)}
        className="flex h-[20px] w-[20px] items-center justify-center"
        aria-label={`${item.itemName} 상세 보기`}
      >
        <img
          src={ArrowIcon}
          alt=""
          className="h-[18px] w-[18px] object-contain"
        />
      </button>

      <button
        type="button"
        onClick={() => onOpenDelete(item)}
        className="ml-[12px] flex h-[20px] w-[20px] items-center justify-center"
        aria-label={`${item.itemName} 삭제`}
      >
        <img
          src={CloseSquareIcon}
          alt=""
          className="h-[18px] w-[18px] object-contain"
        />
      </button>
    </div>
  );
}

function DeleteModal({ isDeleting, onClose, onDelete }) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.32)",
      }}
    >
      <div
        className="relative rounded-[8px] bg-white"
        style={{
          width: "280px",
          minHeight: "190px",
          padding: "30px 28px 26px",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute left-[24px] top-[22px] text-[#272932]"
          style={{
            fontSize: "20px",
            lineHeight: "1",
            fontWeight: 300,
          }}
        >
          x
        </button>

        <p
          className="text-center text-[#272932] tracking-[-0.03em]"
          style={{
            fontSize: "16px",
            lineHeight: "1",
            fontWeight: 700,
          }}
        >
          식단에서 제외하시겠습니까?
        </p>

        <p
          className="mt-[42px] text-center text-[#272932] tracking-[-0.03em]"
          style={{
            fontSize: "13px",
            lineHeight: "1.4",
            fontWeight: 500,
          }}
        >
          제외된 항목은 홈 요약 계산에서 빠집니다.
        </p>

        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="mt-[34px] flex w-full items-center justify-center rounded-[7px] text-white tracking-[-0.02em] disabled:opacity-50"
          style={{
            height: "40px",
            backgroundColor: "#272932",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 700,
          }}
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

  const initialMeal = useMemo(() => {
    const stateMeal = location.state?.meal;

    if (!stateMeal) {
      return fallbackMeal(mealKey);
    }

    const mealType = stateMeal.mealType || MEAL_KEY_TO_TYPE[mealKey];

    return {
      ...fallbackMeal(mealKey),
      ...stateMeal,
      mealKey: stateMeal.mealKey || mealKey,
      mealType,
      label: getMealLabel({
        mealKey: stateMeal.mealKey || mealKey,
        mealType,
        label: stateMeal.label,
      }),
    };
  }, [location.state?.meal, mealKey]);

  const [meal, setMeal] = useState(initialMeal);
  const [pendingDeleteItem, setPendingDeleteItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(initialMeal.mealLogId));
  const [error, setError] = useState("");

  useEffect(() => {
    setMeal(initialMeal);
    setError("");
  }, [initialMeal]);

  useEffect(() => {
    let ignore = false;

    async function loadMealDetail() {
      if (!initialMeal.mealLogId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await getMealLog(initialMeal.mealLogId);

        if (!ignore) {
          setMeal(toMealDisplay(response, mealKey));
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError.message || "식단 상세를 불러오지 못했습니다.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadMealDetail();

    return () => {
      ignore = true;
    };
  }, [initialMeal.mealLogId, mealKey]);

  const mealLabel = getMealLabel({
    mealKey: meal.mealKey || mealKey,
    mealType: meal.mealType,
    label: meal.label,
  });

  const title = `${mealLabel} 영양`;

  const foodItems = useMemo(() => {
    if (meal.items?.length > 0) {
      return meal.items.map((item, index) => normalizeFoodItem(item, index));
    }

    return (meal.foods ?? []).map((food, index) =>
      normalizeFoodItem(food, index)
    );
  }, [meal.items, meal.foods]);

  const recordDate = location.state?.date || formatDateKey(new Date());

  const handleOpenFoodDetail = (item) => {
    const itemName = item.itemName;
    const itemFoodId = item.foodId;

    const detailPath = itemFoodId
      ? `/foods/${itemFoodId}`
      : `/food-detail/${encodeURIComponent(itemName)}`;

    const query = new URLSearchParams();

    if (recordDate) {
      query.set("date", recordDate);
    }

    if (meal.mealType) {
      query.set("mealType", meal.mealType);
    }

    if (meal.mealLogId) {
      query.set("mealLogId", String(meal.mealLogId));
    }

    const queryString = query.toString();

    navigate(`${detailPath}${queryString ? `?${queryString}` : ""}`, {
      state: {
        food: item.food || {
          name: itemName,
          foodName: itemName,
        },
        meal,
        date: recordDate,
      },
    });
  };

  const handleOpenSearch = () => {
    const targetMealKey = meal.mealKey || mealKey;
    const targetMealType =
      meal.mealType || MEAL_KEY_TO_TYPE[targetMealKey] || "BREAKFAST";

    const searchParams = new URLSearchParams({
      mealType: targetMealType,
      date: recordDate,
    });

    navigate(`/search?${searchParams.toString()}`, {
      state: {
        mealKey: targetMealKey,
        meal,
        date: recordDate,
      },
    });
  };

  const handleDelete = async () => {
    if (!pendingDeleteItem) return;

    if (!meal.mealLogId || !pendingDeleteItem.mealLogItemId) {
      const targetName = pendingDeleteItem.itemName;

      setMeal((prev) => ({
        ...prev,
        items: (prev.items ?? []).filter(
          (item) => getFoodName(item) !== targetName
        ),
        foods: (prev.foods ?? []).filter(
          (food) => getFoodName(food) !== targetName
        ),
      }));

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
      {/* 뒤로가기 버튼: header 밖에 따로 빼고, inline style로 회색 정사각형 강제 적용 */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="이전 페이지로 이동"
        className="absolute z-30 flex items-center justify-center transition active:scale-[0.96]"
        style={{
          left: "24px",
  top: "60px",
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

      <main className="absolute left-[24px] right-[24px] top-[166px]">
        <h1
          className="text-[28px] text-[#272932] tracking-[-0.05em]"
          style={{
            fontWeight: 650,
          }}
        >
          {title}
        </h1>

        {isLoading && (
          <p className="mt-[12px] text-[12px] font-light text-[#8a8c90]">
            식단 정보를 불러오는 중입니다.
          </p>
        )}

        {error && (
          <p className="mt-[12px] text-[12px] font-light text-[#ff5b5b]">
            {error}
          </p>
        )}

        <div className="mt-[28px]">
          <NutritionSummaryBox
            label="총 열량"
            value={meal.kcal ?? 0}
            unit="kcal"
            wide
          />

          <div className="mt-[12px] grid grid-cols-3 gap-[8px]">
            <NutritionSummaryBox label="탄수화물" value={meal.carbs ?? 0} />
            <NutritionSummaryBox label="단백질" value={meal.protein ?? 0} />
            <NutritionSummaryBox label="지방" value={meal.fat ?? 0} />
          </div>
        </div>

        <section className="mt-[34px]">
          <div className="flex items-center justify-between">
            <h2
              className="text-[20px] text-[#272932] tracking-[-0.04em]"
              style={{
                fontWeight: 650,
              }}
            >
              {mealLabel} 식단
            </h2>

            {/* + 버튼: 빨간 테두리 박스 강제 적용 */}
            <button
              type="button"
              onClick={handleOpenSearch}
              aria-label={`${mealLabel} 식단에 음식 추가`}
              className="flex shrink-0 items-center justify-center transition active:scale-[0.95]"
              style={{
                width: "18px",
                height: "18px",
                padding: 0,
                borderRadius: "5px",
                border: "1.5px solid #ff3b30",
                backgroundColor: "#ffffff",
                color: "#ff3b30",
                fontSize: "17px",
                fontWeight: 400,
                lineHeight: "1",
                transform: "translateY(-2px)",
              }}
            >
              <span
                style={{
                  display: "block",
                  transform: "translateY(-1px)",
                }}
              >
                +
              </span>
            </button>
          </div>

          <div className="mt-[22px] space-y-[4px]">
            {foodItems.length > 0 ? (
              foodItems.map((item) => (
                <FoodRow
                  key={item.fallbackKey}
                  item={item}
                  onOpenDetail={handleOpenFoodDetail}
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