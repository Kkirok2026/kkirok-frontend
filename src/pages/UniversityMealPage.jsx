import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import PageHeader from "../components/layout/PageHeader";
import BottomNav from "../components/layout/BottomNav";
import Modal from "../components/common/Modal";
import { addMenuOption } from "../api/mealLogApi";
import { compareMenus, getDailyMenu } from "../api/menuApi";
import { formatDateKey, toMealDisplay, toRounded } from "../utils/mealData";

const DEFAULT_UNIVERSITY_ID = 2;

function optionLines(optionName = "") {
  return optionName
    .split("/")
    .map((line) => line.trim())
    .filter(Boolean);
}

function MenuCard({ item, highlighted = false }) {
  const nutrients = item?.nutrients || {};
  const lines = optionLines(item?.optionName);

  return (
    <div
      className={[
        "rounded-2xl border p-5 mb-6 shadow-sm",
        highlighted ? "border-orange-300" : "border-neutral-200",
      ].join(" ")}
    >
      <p className="text-2xl font-extrabold text-lime-600 mb-2">
        {toRounded(nutrients.caloriesKcal)} kcal
      </p>

      <div className="text-xs text-neutral-400 mb-3">
        <p>탄수화물 : {toRounded(nutrients.carbG)}g</p>
        <p>단백질 : {toRounded(nutrients.proteinG)}g</p>
        <p>지방 : {toRounded(nutrients.fatG)}g</p>
      </div>

      <div className="text-sm leading-6">
        {lines.length > 0 ? (
          lines.map((line) => <p key={line}>{line}</p>)
        ) : (
          <p>{item?.categoryName || "메뉴 정보 없음"}</p>
        )}
      </div>
    </div>
  );
}

export default function UniversityMealPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mealType, setMealType] = useState("LUNCH");
  const [date] = useState(() => formatDateKey(new Date()));
  const [dailyMenu, setDailyMenu] = useState(null);
  const [compareResult, setCompareResult] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadDailyMenu() {
      setIsLoading(true);
      setError("");
      setCompareResult(null);

      try {
        const response = await getDailyMenu({
          universityId: DEFAULT_UNIVERSITY_ID,
          date,
          mealType,
        });

        if (!ignore) setDailyMenu(response);
      } catch (loadError) {
        if (!ignore) {
          setDailyMenu(null);
          setError(loadError.message || "학교 식당 메뉴를 불러오지 못했습니다.");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadDailyMenu();

    return () => {
      ignore = true;
    };
  }, [date, mealType]);

  const studentOptions = useMemo(() => {
    return (dailyMenu?.diningPlaces ?? [])
      .filter((place) => place.diningPlaceType === "STUDENT")
      .flatMap((place) =>
        (place.options ?? []).map((option) => ({
          ...option,
          diningPlaceName: place.diningPlaceName,
          diningPlaceType: place.diningPlaceType,
        }))
      );
  }, [dailyMenu]);

  const dormitoryOptions = useMemo(() => {
    return (dailyMenu?.diningPlaces ?? [])
      .filter((place) => place.diningPlaceType === "DORMITORY")
      .flatMap((place) =>
        (place.options ?? []).map((option) => ({
          ...option,
          diningPlaceName: place.diningPlaceName,
          diningPlaceType: place.diningPlaceType,
        }))
      );
  }, [dailyMenu]);

  useEffect(() => {
    if (studentOptions.length === 0) {
      setSelectedOptionId(null);
      return;
    }

    if (!studentOptions.some((option) => option.optionId === selectedOptionId)) {
      setSelectedOptionId(studentOptions[0].optionId);
    }
  }, [selectedOptionId, studentOptions]);

  useEffect(() => {
    if (!selectedOptionId) return;

    let ignore = false;

    async function loadCompare() {
      try {
        const response = await compareMenus({
          universityId: DEFAULT_UNIVERSITY_ID,
          date,
          mealType,
          studentOptionId: selectedOptionId,
        });

        if (!ignore) setCompareResult(response);
      } catch (compareError) {
        if (!ignore && compareError.status !== 401) {
          setError(compareError.message || "메뉴 비교 정보를 불러오지 못했습니다.");
        }
      }
    }

    loadCompare();

    return () => {
      ignore = true;
    };
  }, [date, mealType, selectedOptionId]);

  const compareItems = compareResult?.items ?? [];
  const selectedOption =
    compareItems.find((item) => item.optionId === selectedOptionId) ||
    studentOptions.find((item) => item.optionId === selectedOptionId);
  const comparisonOptions =
    compareItems.filter((item) => item.optionId !== selectedOptionId).length > 0
      ? compareItems.filter((item) => item.optionId !== selectedOptionId)
      : dormitoryOptions;

  const handleAddMenu = async () => {
    if (!selectedOption?.optionId || isAdding) return;

    setIsAdding(true);
    setError("");

    try {
      const response = await addMenuOption({
        menuOptionId: selectedOption.optionId,
        memo: selectedOption.categoryName || selectedOption.optionName,
      });
      const meal = toMealDisplay(response);

      navigate(`/meal-details/${meal.mealKey}`, {
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
      setOpen(false);
    }
  };

  return (
    <MobileLayout>
      <div className="absolute inset-0 overflow-y-auto px-7 pb-[132px]">
        <PageHeader eyebrow="University Meal" title="77ㅣ록" />

        <div className="grid grid-cols-2 bg-neutral-50 rounded-full p-2 mb-5">
          <button
            type="button"
            onClick={() => setMealType("LUNCH")}
            className={[
              "h-10 rounded-full text-sm",
              mealType === "LUNCH"
                ? "bg-neutral-800 text-white"
                : "text-neutral-400",
            ].join(" ")}
          >
            점심
          </button>
          <button
            type="button"
            onClick={() => setMealType("DINNER")}
            className={[
              "h-10 rounded-full text-sm",
              mealType === "DINNER"
                ? "bg-neutral-800 text-white"
                : "text-neutral-400",
            ].join(" ")}
          >
            저녁
          </button>
        </div>

        {studentOptions.length > 0 && (
          <div className="grid grid-cols-4 gap-1 bg-neutral-100 rounded-lg p-1 mb-4">
            {studentOptions.map((option) => (
              <button
                type="button"
                key={option.optionId}
                onClick={() => setSelectedOptionId(option.optionId)}
                className={[
                  "h-8 rounded-md text-[10px] truncate px-1",
                  option.optionId === selectedOptionId
                    ? "bg-neutral-700 text-white"
                    : "text-neutral-500",
                ].join(" ")}
              >
                {option.categoryName || option.optionName}
              </button>
            ))}
          </div>
        )}

        {isLoading && (
          <p className="text-xs text-neutral-400 mb-4">메뉴를 불러오는 중입니다.</p>
        )}

        {error && <p className="text-xs text-[#ff5b5b] mb-4">{error}</p>}

        {selectedOption ? (
          <MenuCard item={selectedOption} highlighted />
        ) : (
          !isLoading && (
            <p className="text-xs text-neutral-400 mb-8">
              선택할 학생식당 메뉴가 없습니다.
            </p>
          )
        )}

        {selectedOption && comparisonOptions.length > 0 && (
          <>
            <p className="text-center text-2xl font-extrabold mb-8">VS</p>

            {comparisonOptions.map((item) => (
              <MenuCard key={item.optionId} item={item} />
            ))}
          </>
        )}

        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={!selectedOption}
          className="ml-auto flex items-center gap-3 px-5 h-9 rounded-full bg-neutral-800 text-white text-xs disabled:opacity-40"
        >
          이걸로 먹을래요
          <span>+</span>
        </button>
      </div>

      <BottomNav />

      <Modal
        open={open}
        title="식단에 추가하시겠습니까?"
        confirmText={isAdding ? "추가 중..." : "추가"}
        onConfirm={handleAddMenu}
        onCancel={() => setOpen(false)}
      />
    </MobileLayout>
  );
}
