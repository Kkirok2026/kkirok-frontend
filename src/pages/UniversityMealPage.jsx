import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import PageHeader from "../components/layout/PageHeader";
import BottomNav from "../components/layout/BottomNav";
import { addMenuOption } from "../api/mealLogApi";
import { compareMenus } from "../api/menuApi";
import { getMe } from "../api/userApi";
import {
  formatDateKey,
  parseDateKey,
  toMealDisplay,
  toRounded,
} from "../utils/mealData";

const DINING_TYPE_ORDER = ["STUDENT", "DORMITORY"];

const COLORS = {
  dark: "#272932",
  tabDark: "#4f525b",
  lightTab: "#f3f3f4",
  inactiveText: "#a8a8a8",
  green: "#6daa0f",
  orangeBorder: "#f0935c",
  grayBorder: "#b9b0ad",
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

function MealTypeTabs({ mealType, onChange }) {
  const tabs = [
    { value: "LUNCH", label: "점심" },
    { value: "DINNER", label: "저녁" },
  ];

  return (
    <div className="mx-[22px] mb-[24px] grid h-[56px] grid-cols-2 rounded-full bg-[#f5f5f5] p-[9px]">
      {tabs.map((tab) => {
        const active = mealType === tab.value;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className="h-[38px] rounded-full text-[15px] font-bold transition"
            style={{
              backgroundColor: active ? COLORS.dark : "transparent",
              color: active ? "#ffffff" : COLORS.inactiveText,
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function CategoryTabs({ options, activeOptionId, onSelect }) {
  if (options.length === 0) return null;

  return (
    <div className="mx-[22px] mb-[16px] flex h-[33px] rounded-[7px] bg-[#eeeeef] p-[2px]">
      {options.map((option) => {
        const active = option.optionId === activeOptionId;

        return (
          <button
            type="button"
            key={option.optionId}
            onClick={() => onSelect(option)}
            className="h-full min-w-0 flex-1 rounded-[6px] px-[8px] truncate text-[11px] font-semibold transition"
            style={{
              backgroundColor: active ? COLORS.tabDark : "transparent",
              color: active ? "#ffffff" : "#555861",
            }}
          >
            {categoryLabel(option)}
          </button>
        );
      })}
    </div>
  );
}

function MenuCard({ item, selected, onSelect }) {
  const nutrients = item?.nutrients || {};
  const lines = optionLines(item?.optionName);
  const warnings = item?.allergyWarnings ?? [];

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="w-full min-h-[154px] rounded-[18px] border bg-white grid grid-cols-[116px_1fr] items-center gap-[10px] px-[28px] py-[26px] text-left transition"
      style={{
        border: `1.2px solid ${selected ? "#B87850" : "#B87850"}`,
        boxShadow: "none",
      }}
    >
      <div>
        <p
          className="text-[22px] font-extrabold leading-none tracking-[-0.03em]"
          style={{ color: COLORS.green }}
        >
          {toRounded(nutrients.caloriesKcal)} kcal
        </p>

        <div className="mt-[15px] space-y-[7px] text-[10px] font-light text-[#6f7075]">
          <p>탄수화물 : {toRounded(nutrients.carbG)}g</p>
          <p>단백질 : {toRounded(nutrients.proteinG)}g</p>
          <p>지방 : {toRounded(nutrients.fatG)}g</p>
        </div>
      </div>

      <div className="space-y-[8px] text-[13px] font-medium leading-[18px] text-[#272932]">
        {lines.length > 0 ? (
          lines.map((line) => <p key={line}>{line}</p>)
        ) : (
          <p>{categoryLabel(item)}</p>
        )}

        {warnings.length > 0 && (
          <p className="pt-[8px] text-[10px] font-light leading-[15px] text-[#ff7b45]">
            {warnings[0].message}
          </p>
        )}
      </div>
    </button>
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
  const [searchParams] = useSearchParams();

  const date = formatDateKey(
    parseDateKey(searchParams.get("date")) || new Date()
  );

  const [mealType, setMealType] = useState("LUNCH");
  const [universityId, setUniversityId] = useState(null);
  const [dailyMenu, setDailyMenu] = useState(null);

  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [activeOptionIds, setActiveOptionIds] = useState({});

  const [isResolvingUniversity, setIsResolvingUniversity] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

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
          setDailyMenu(null);
          setError("학교 인증 계정만 학식 메뉴를 확인할 수 있습니다.");
          return;
        }

        setUniversityId(university.universityId);
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
      setActiveOptionIds({});

      try {
        const response = await compareMenus({
          universityId,
          date,
          mealType,
        });

        const groups = new Map();

        for (const item of response?.items ?? []) {
          const key = `${item.diningPlaceType}:${item.diningPlaceName}`;

          if (!groups.has(key)) {
            groups.set(key, {
              diningPlaceId: key,
              diningPlaceName: item.diningPlaceName,
              diningPlaceType: item.diningPlaceType,
              options: [],
            });
          }

          groups.get(key).options.push(item);
        }

        if (!ignore) {
          setDailyMenu({
            universityId: response?.universityId ?? universityId,
            date: response?.date ?? date,
            mealType: response?.mealType ?? mealType,
            diningPlaces: Array.from(groups.values()),
          });
        }
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
      (type) =>
        !DINING_TYPE_ORDER.includes(type) &&
        (groupedOptions[type] ?? []).length > 0
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
    (option) => option.optionId === selectedOptionId
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

    const selectedName = categoryLabel(selectedOption);

    setIsAdding(true);
    setError("");

    try {
      const response = await addMenuOption({
        menuOptionId: selectedOption.optionId,
        memo: selectedName,
        itemName: selectedName,
        logDate: date,
        mealType,
      });

      const meal = toMealDisplay(response);

      navigate(`/meal-details/${meal.mealKey}`, {
        state: {
          meal,
          date: meal.logDate || date,
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

  const addButtonDisabled = !selectedOption || !universityId || isAdding;

  return (
    <MobileLayout>
      <div className="absolute inset-0 overflow-y-auto px-[40px] pb-[170px]">
        <PageHeader
          eyebrow="University Meal"
          title="77ㅣ록"
          className="!pb-[86px]"
        />

        <MealTypeTabs mealType={mealType} onChange={setMealType} />

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
                <p className="my-[27px] text-center text-[30px] font-extrabold leading-none tracking-[-0.03em] text-[#272932]">
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

      <div
  className="absolute bottom-[104px] right-[40px] z-40"
  style={{
    width: "164px",
    height: "32px",
  }}
>
  <button
    type="button"
    onClick={handleAddMenu}
    disabled={addButtonDisabled}
    className="transition disabled:opacity-40"
    style={{
      width: "164px",
      height: "32px",
      borderRadius: "9999px",
      backgroundColor: COLORS.dark,
      color: "#ffffff",
      boxShadow: "none",
      border: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      paddingLeft: "18px",
      paddingRight: "18px",
      fontSize: "12px",
      fontWeight: 700,
      lineHeight: "1",
      whiteSpace: "nowrap",
    }}
  >
    <span
      style={{
        fontSize: "12px",
        fontWeight: 700,
        lineHeight: "1",
      }}
    >
      {isAdding ? "추가 중..." : "이걸로 먹을래요"}
    </span>

    <span
      style={{
        fontSize: "20px",
        fontWeight: 300,
        lineHeight: "1",
        marginTop: "-1px",
      }}
    >
      +
    </span>
  </button>
</div>

      <BottomNav />
    </MobileLayout>
  );
}