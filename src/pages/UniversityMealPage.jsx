import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import PageHeader from "../components/layout/PageHeader";
import BottomNav from "../components/layout/BottomNav";
import CalendarModal from "../components/common/CalendarModal";
import { addMenuOption } from "../api/mealLogApi";
import { getDailyMenu } from "../api/menuApi";
import { getMe } from "../api/userApi";
import {
  formatDateKey,
  parseDateKey,
  toMealDisplay,
  toRounded,
} from "../utils/mealData";

const DINING_TYPE_ORDER = ["STUDENT", "DORMITORY"];
const DINING_TYPE_LABELS = {
  STUDENT: "학생식당",
  DORMITORY: "생활관 식당",
};

function optionLines(optionName = "") {
  return optionName
    .split("/")
    .map((line) => line.trim())
    .filter(Boolean);
}

function categoryLabel(item) {
  return item?.categoryName || item?.diningPlaceName || item?.optionName || "메뉴";
}

function enrichOption(option, place) {
  return {
    ...option,
    diningPlaceId: place.diningPlaceId,
    diningPlaceName: place.diningPlaceName,
    diningPlaceType: place.diningPlaceType,
  };
}

function MenuCard({ item, selected, onSelect }) {
  const nutrients = item?.nutrients || {};
  const lines = optionLines(item?.optionName);

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={[
        "mb-[28px] w-full rounded-[18px] border bg-white px-[28px] py-[30px]",
        "grid grid-cols-[92px_1fr] gap-[20px] text-left transition",
        selected
          ? "border-[#ff8b45] shadow-[0_18px_34px_rgba(255,139,69,0.14)]"
          : "border-[#d8d0d0] shadow-[0_14px_26px_rgba(39,41,50,0.04)]",
      ].join(" ")}
    >
      <div>
        <p className="text-[22px] font-extrabold leading-none text-[#6daa0f]">
          {toRounded(nutrients.caloriesKcal)} kcal
        </p>

        <div className="mt-[12px] space-y-[6px] text-[10px] font-light text-[#6f7075]">
          <p>탄수화물 : {toRounded(nutrients.carbG)}g</p>
          <p>단백질 : {toRounded(nutrients.proteinG)}g</p>
          <p>지방 : {toRounded(nutrients.fatG)}g</p>
        </div>
      </div>

      <div className="space-y-[8px] text-[13px] font-medium leading-[18px] text-[#272932]">
        {lines.length > 0 ? (
          lines.map((line) => <p key={line}>{line}</p>)
        ) : (
          <p>{item?.categoryName || "메뉴 정보 없음"}</p>
        )}
      </div>
    </button>
  );
}

function CategoryTabs({ options, activeOptionId, onSelect }) {
  if (options.length === 0) return null;

  return (
    <div className="mb-[16px] flex rounded-[8px] bg-[#f1f1f2] p-[3px]">
      {options.map((option) => {
        const active = option.optionId === activeOptionId;

        return (
          <button
            type="button"
            key={option.optionId}
            onClick={() => onSelect(option)}
            className={[
              "h-[29px] min-w-0 flex-1 rounded-[7px] px-[8px]",
              "truncate text-[11px] font-medium transition",
              active ? "bg-[#5b5e68] text-white" : "text-[#565862]",
            ].join(" ")}
          >
            {categoryLabel(option)}
          </button>
        );
      })}
    </div>
  );
}

function DiningSection({
  options,
  activeOptionId,
  selectedOptionId,
  onSelect,
}) {
  if (options.length === 0) return null;

  const activeOption =
    options.find((option) => option.optionId === activeOptionId) || options[0];

  return (
    <section>
      <p className="mb-[8px] text-[11px] font-bold text-[#8a8c90]">
        {DINING_TYPE_LABELS[activeOption.diningPlaceType] || activeOption.diningPlaceName}
      </p>

      <CategoryTabs
        options={options}
        activeOptionId={activeOption.optionId}
        onSelect={onSelect}
      />

      <MenuCard
        item={activeOption}
        selected={activeOption.optionId === selectedOptionId}
        onSelect={onSelect}
      />
    </section>
  );
}

export default function UniversityMealPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mealType, setMealType] = useState("LUNCH");
  const [selectedDate, setSelectedDate] = useState(
    () => parseDateKey(searchParams.get("date")) || new Date()
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const date = formatDateKey(selectedDate);
  const [universityId, setUniversityId] = useState(null);
  const [universityName, setUniversityName] = useState("");
  const [dailyMenu, setDailyMenu] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [activeOptionIds, setActiveOptionIds] = useState({});
  const [isResolvingUniversity, setIsResolvingUniversity] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  const updateSelectedDate = (nextDate, options = {}) => {
    setSelectedDate(nextDate);
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set("date", formatDateKey(nextDate));
        return next;
      },
      { replace: options.replace ?? false }
    );
  };

  useEffect(() => {
    const queryDate = parseDateKey(searchParams.get("date"));

    if (queryDate && formatDateKey(queryDate) !== date) {
      setSelectedDate(queryDate);
    }
  }, [date, searchParams]);

  useEffect(() => {
    let ignore = false;

    async function loadUniversity() {
      setIsResolvingUniversity(true);
      setError("");

      try {
        const response = await getMe();
        const university = response?.university;

        if (ignore) return;

        if (!university?.universityId) {
          setUniversityId(null);
          setUniversityName("");
          setDailyMenu(null);
          setError("학교 인증 계정만 학식 메뉴를 확인할 수 있습니다.");
          return;
        }

        setUniversityId(university.universityId);
        setUniversityName(university.universityName || "");
      } catch (loadError) {
        if (ignore) return;

        if (loadError.status === 401) {
          navigate("/login", { replace: true });
          return;
        }

        setError(loadError.message || "학교 정보를 불러오지 못했습니다.");
      } finally {
        if (!ignore) setIsResolvingUniversity(false);
      }
    }

    loadUniversity();

    return () => {
      ignore = true;
    };
  }, [navigate]);

  useEffect(() => {
    if (!universityId) return;

    let ignore = false;

    async function loadDailyMenu() {
      setIsLoading(true);
      setError("");
      setSelectedOptionId(null);

      try {
        const response = await getDailyMenu({
          universityId,
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
  }, [date, mealType, universityId]);

  const groupedOptions = useMemo(() => {
    const groups = {};

    for (const place of dailyMenu?.diningPlaces ?? []) {
      const type = place.diningPlaceType;
      groups[type] = [
        ...(groups[type] ?? []),
        ...(place.options ?? []).map((option) => enrichOption(option, place)),
      ];
    }

    return groups;
  }, [dailyMenu]);

  const visibleDiningTypes = useMemo(() => {
    const knownTypes = DINING_TYPE_ORDER.filter(
      (type) => (groupedOptions[type] ?? []).length > 0
    );
    const otherTypes = Object.keys(groupedOptions).filter(
      (type) => !DINING_TYPE_ORDER.includes(type) && groupedOptions[type].length > 0
    );

    return [...knownTypes, ...otherTypes];
  }, [groupedOptions]);

  const allOptions = useMemo(() => {
    return visibleDiningTypes.flatMap((type) => groupedOptions[type] ?? []);
  }, [groupedOptions, visibleDiningTypes]);

  useEffect(() => {
    if (allOptions.length === 0) {
      setSelectedOptionId(null);
      setActiveOptionIds({});
      return;
    }

    setActiveOptionIds((current) => {
      const next = {};

      for (const type of visibleDiningTypes) {
        const options = groupedOptions[type] ?? [];
        const currentId = current[type];
        next[type] = options.some((option) => option.optionId === currentId)
          ? currentId
          : options[0]?.optionId;
      }

      return next;
    });

    if (!allOptions.some((option) => option.optionId === selectedOptionId)) {
      setSelectedOptionId(allOptions[0].optionId);
    }
  }, [allOptions, groupedOptions, selectedOptionId, visibleDiningTypes]);

  const selectedOption = allOptions.find(
    (item) => item.optionId === selectedOptionId
  );

  const handleSelectOption = (option) => {
    setActiveOptionIds((current) => ({
      ...current,
      [option.diningPlaceType]: option.optionId,
    }));
    setSelectedOptionId(option.optionId);
  };

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
    }
  };

  return (
    <MobileLayout>
      <div className="absolute inset-0 overflow-y-auto px-[38px] pb-[166px]">
        <PageHeader eyebrow="University Meal" title="77ㅣ록" className="pb-[80px]" />

        <button
          type="button"
          onClick={() => setIsCalendarOpen(true)}
          aria-label="식당 메뉴 날짜 선택"
          className="relative z-30 -mt-[64px] mb-[38px] mx-auto flex h-[36px] min-w-[124px] items-center justify-center rounded-full bg-[#f8f8f8] px-[16px] text-[12px] font-bold text-[#6f7075]"
        >
          {date}
        </button>

        {universityName && (
          <p className="-mt-[26px] mb-[28px] text-center text-[11px] text-[#a2a2a2]">
            {universityName}
          </p>
        )}

        <div className="mb-[24px] grid grid-cols-2 rounded-full bg-[#f7f7f7] p-[10px]">
          <button
            type="button"
            onClick={() => setMealType("LUNCH")}
            className={[
              "h-[40px] rounded-full text-[15px] font-bold transition",
              mealType === "LUNCH"
                ? "bg-[#272932] text-white"
                : "text-[#b8b8b8]",
            ].join(" ")}
          >
            점심
          </button>
          <button
            type="button"
            onClick={() => setMealType("DINNER")}
            className={[
              "h-[40px] rounded-full text-[15px] font-bold transition",
              mealType === "DINNER"
                ? "bg-[#272932] text-white"
                : "text-[#b8b8b8]",
            ].join(" ")}
          >
            저녁
          </button>
        </div>

        {(isResolvingUniversity || isLoading) && (
          <p className="mb-[18px] text-center text-[12px] text-neutral-400">
            메뉴를 불러오는 중입니다.
          </p>
        )}

        {error && (
          <p className="mb-[18px] text-center text-[12px] text-[#ff5b5b]">
            {error}
          </p>
        )}

        {visibleDiningTypes.length > 0 ? (
          visibleDiningTypes.map((type, index) => (
            <div key={type}>
              {index > 0 && (
                <p className="mb-[28px] text-center text-[30px] font-extrabold leading-none text-[#272932]">
                  VS
                </p>
              )}

              <DiningSection
                options={groupedOptions[type] ?? []}
                activeOptionId={activeOptionIds[type]}
                selectedOptionId={selectedOptionId}
                onSelect={handleSelectOption}
              />
            </div>
          ))
        ) : (
          universityId &&
          !isResolvingUniversity &&
          !isLoading && (
            <p className="mt-[46px] text-center text-[13px] text-neutral-400">
              선택할 식당 메뉴가 없습니다.
            </p>
          )
        )}
      </div>

      <div className="absolute bottom-[104px] right-[38px] z-40">
        <button
          type="button"
          onClick={handleAddMenu}
          disabled={!selectedOption || !universityId || isAdding}
          className="flex h-[34px] min-w-[150px] items-center justify-center gap-[18px] rounded-full bg-[#272932] px-[20px] text-[12px] font-bold text-white shadow-[0_12px_24px_rgba(39,41,50,0.18)] disabled:opacity-40"
        >
          {isAdding ? "추가 중..." : "내 식단에 추가하기"}
          <span className="text-[18px] font-light leading-none">+</span>
        </button>
      </div>

      <CalendarModal
        open={isCalendarOpen}
        selectedDate={selectedDate}
        onSelect={updateSelectedDate}
        onClose={() => setIsCalendarOpen(false)}
      />

      <BottomNav />
    </MobileLayout>
  );
}
