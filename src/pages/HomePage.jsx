import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import KkirokLogo from "../components/common/KkirokLogo";
import BottomNav from "../components/layout/BottomNav";
import CalendarModal from "../components/common/CalendarModal";
import { getDailySummary, getMealLogsByDate } from "../api/mealLogApi";
import {
  MEAL_KEY_TO_TYPE,
  emptyMeals,
  formatDateKey,
  parseDateKey,
  toDailyDisplay,
} from "../utils/mealData";

const MACRO_COLORS = {
  protein: "#d4ef66",
  fat: "#ff9b67",
  carbs: "#8f9396",
  empty: "#eeeeee",
};

const today = new Date();

function getDateKey(date) {
  return formatDateKey(date);
}

function getMonthLabel(date) {
  return date.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function getDayName(date) {
  return date.toLocaleString("en-US", { weekday: "short" }).slice(0, 3);
}

function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function getMondayOfWeek(date) {
  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;

  return addDays(date, offset);
}

function addMonths(date, months) {
  const year = date.getFullYear();
  const month = date.getMonth() + months;
  const day = date.getDate();
  const lastDay = new Date(year, month + 1, 0).getDate();

  return new Date(year, month, Math.min(day, lastDay));
}

function DateCarousel({
  selectedDate,
  onOpenCalendar,
  currentMonth,
  onChangeMonth,
  onSelectDate,
}) {
  const weekStart = useMemo(() => getMondayOfWeek(selectedDate), [selectedDate]);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart]
  );

  return (
    <section className="mt-[44px]">
      <div className="flex items-center justify-center gap-[26px]">
        <button
          type="button"
          onClick={() => onChangeMonth(-1)}
          className="text-[18px] leading-none font-light text-[#a0a0a0]"
        >
          ‹
        </button>

        <button
  type="button"
  onClick={onOpenCalendar}
  className="font-light tracking-[-0.02em]"
  style={{
    fontSize: "11px",
    lineHeight: "1",
    color: "#9a9a9a",
  }}
>
  {getMonthLabel(currentMonth)}
</button>

        <button
          type="button"
          onClick={() => onChangeMonth(1)}
          className="text-[18px] leading-none font-light text-[#a0a0a0]"
        >
          ›
        </button>
      </div>

      <div className="mt-[16px] grid grid-cols-7 gap-[8px] px-[22px]">
        {days.map((date) => {
          const selected = getDateKey(date) === getDateKey(selectedDate);

          return (
            <button
              key={getDateKey(date)}
              type="button"
              onClick={() => onSelectDate(date)}
              className="h-[62px] min-w-0 rounded-[7px] border flex flex-col items-center justify-center transition"
              style={{
                backgroundColor: selected ? "#9bb314" : "#f8f8f8",
                borderColor: selected ? "#9bb314" : "#d1d1d1",
                color: selected ? "#ffffff" : "#7f8085",
              }}
            >
              <span
                className="font-light tracking-[-0.02em]"
                style={{ fontSize: "10px", lineHeight: "1" }}
              >
                {getDayName(date)}
              </span>

              <span
                className="mt-[14px] font-light tracking-[-0.02em]"
                style={{ fontSize: "12px", lineHeight: "1" }}
              >
                {date.getDate()}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function WarningBox({ warnings = [] }) {
  const [visible, setVisible] = useState(true);
  const firstWarning = warnings[0];

  useEffect(() => {
    setVisible(true);
  }, [warnings]);

  if (!visible || !firstWarning) return null;

  return (
    <section
      className="relative mx-[58px] mt-[30px] h-[78px] rounded-[7px] px-[20px] pt-[15px]"
      style={{ backgroundColor: "#fde3e2" }}
    >
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="absolute right-[16px] top-[12px] text-[16px] font-light text-[#8f7777]"
      >
        ×
      </button>

      <p
        className="font-light tracking-[-0.02em]"
        style={{
          color: "#ff5b5b",
          fontSize: "10px",
          lineHeight: "1",
        }}
      >
        경고
      </p>

      <p
        className="mt-[9px] font-bold tracking-[-0.02em]"
        style={{
          color: "#272932",
          fontSize: "12px",
          lineHeight: "1.35",
        }}
      >
        {firstWarning.message}
      </p>
    </section>
  );
}

function DonutChart({ data }) {
  const hasData = Boolean(data);

  const totalKcal = Number(data?.totalKcal ?? 0);
  const recommendedKcal = Number(data?.recommendedTargets?.caloriesKcal ?? 0);
  const hasRecommendedKcal =
  Number.isFinite(recommendedKcal) && recommendedKcal > 0;
  const protein = Number(data?.macros?.protein ?? 0);
  const fat = Number(data?.macros?.fat ?? 0);
  const carbs = Number(data?.macros?.carbs ?? 0);

  const totalMacro = protein + fat + carbs;
  const hasMacroData = hasData && totalMacro > 0;

  const chartSize = 202;
  const bubbleAreaSize = 260;
  const center = bubbleAreaSize / 2;
  const bubbleRadius = 107;

  const startAngle = -76;

  const segments = hasMacroData
    ? [
        {
          key: "protein",
          label: "단백질",
          value: protein,
          color: MACRO_COLORS.protein,
          bubbleSize: 70,
        },
        {
          key: "fat",
          label: "지방",
          value: fat,
          color: MACRO_COLORS.fat,
          bubbleSize: 70,
        },
        {
          key: "carbs",
          label: "탄수화물",
          value: carbs,
          color: MACRO_COLORS.carbs,
          bubbleSize: 78,
        },
      ]
    : [];

  let accumulatedAngle = startAngle;

  const computedSegments = segments.map((segment) => {
    const ratio = segment.value / totalMacro;
    const angleSize = ratio * 360;
    const from = accumulatedAngle;
    const to = accumulatedAngle + angleSize;
    const mid = from + angleSize / 2;

    accumulatedAngle = to;

    return {
      ...segment,
      ratio,
      from,
      to,
      mid,
    };
  });

  const gradient = hasMacroData
    ? `conic-gradient(
        from ${startAngle}deg,
        ${computedSegments
          .map((segment) => {
            return `${segment.color} ${segment.from - startAngle}deg ${
              segment.to - startAngle
            }deg`;
          })
          .join(", ")}
      )`
    : `conic-gradient(${MACRO_COLORS.empty} 0deg 360deg)`;

  const getBubblePosition = (angleDeg) => {
    const rad = (angleDeg * Math.PI) / 180;

    return {
      left: center + Math.sin(rad) * bubbleRadius,
      top: center - Math.cos(rad) * bubbleRadius,
    };
  };

  return (
    <section className="mx-[58px] mt-[24px]">
      <h2 className="text-[18px] font-semibold text-[#272932] tracking-[-0.04em]">
        나의 하루 영양
      </h2>

      <div
        className="relative mt-[30px] mx-auto"
        style={{
          width: `${bubbleAreaSize}px`,
          height: `${bubbleAreaSize}px`,
        }}
      >
        <div
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: `${chartSize}px`,
            height: `${chartSize}px`,
            transform: "translate(-50%, -50%)",
            background: gradient,
          }}
        >
          <div className="absolute left-1/2 top-1/2 w-[108px] h-[108px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white flex flex-col items-center justify-center">
  <span className="text-[24px] font-extrabold text-[#6da60f] tracking-[-0.04em]">
    {hasData ? `${Math.round(totalKcal)} kcal` : ""}
  </span>

  {hasRecommendedKcal && (
    <span className="mt-[2px] text-[10px] font-semibold text-[#8a8a8a] tracking-[-0.04em]">
      권장 칼로리 : {Math.round(recommendedKcal)}kcal
    </span>
  )}
</div>
        </div>

        {hasMacroData &&
          computedSegments.map((segment) => {
            const position = getBubblePosition(segment.mid);

            return (
              <div
                key={segment.key}
                className="absolute rounded-full bg-white shadow-[0_10px_22px_rgba(0,0,0,0.18)] flex flex-col items-center justify-center"
                style={{
                  width: `${segment.bubbleSize}px`,
                  height: `${segment.bubbleSize}px`,
                  left: `${position.left}px`,
                  top: `${position.top}px`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <span className="text-[10px] font-light text-[#777]">
                  {segment.label}
                </span>

                <span
                  className="mt-[4px] text-[#272932] tracking-[-0.04em]"
                  style={{
                    fontSize: "22px",
                    lineHeight: "1",
                    fontWeight: 500,
                  }}
                >
                  {segment.value}g
                </span>
              </div>
            );
          })}
      </div>
    </section>
  );
}

function MealCard({ meal, onClick }) {
  const hasData = Boolean(
    meal?.mealLogId ||
      Number(meal?.kcal) > 0 ||
      Number(meal?.carbs) > 0 ||
      Number(meal?.protein) > 0 ||
      Number(meal?.fat) > 0 ||
      meal?.foods?.length ||
      meal?.items?.length
  );

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: "1px solid #B9ADAF",
      }}
      className={[
        "relative h-[126px] rounded-[14px] bg-white",
        "px-[16px] pt-[18px] text-left",
        "shadow-[0_10px_24px_rgba(29,22,23,0.04)]",
        "active:scale-[0.99] transition",
      ].join(" ")}
    >
      <span className="absolute right-[14px] top-[10px] text-[18px] leading-none font-light text-[#5f6065]">
        +
      </span>

      <p className="absolute left-[16px] top-[18px] text-[11px] font-semibold text-[#272932] tracking-[-0.02em]">
        {meal?.label || "식단"}
      </p>

      {hasData && (
        <div className="absolute left-[16px] right-[16px] top-[48px]">
          <p className="text-[17px] leading-none font-bold text-[#6da60f] tracking-[-0.04em]">
            {meal.kcal ?? 0} kcal
          </p>

          <div className="mt-[6px] h-[1px] w-[74px] bg-[#e2e2e2]" />

          <div className="mt-[7px] space-y-[4px]">
            <p className="text-[8px] leading-[1.15] font-light text-[#6f7075] tracking-[-0.02em]">
              탄수화물 : {meal.carbs ?? 0}g
            </p>
            <p className="text-[8px] leading-[1.15] font-light text-[#6f7075] tracking-[-0.02em]">
              단백질 : {meal.protein ?? 0}g
            </p>
            <p className="text-[8px] leading-[1.15] font-light text-[#6f7075] tracking-[-0.02em]">
              지방 : {meal.fat ?? 0}g
            </p>
          </div>
        </div>
      )}
    </button>
  );
}

function MealRecords({ dailyData, selectedDateKey }) {
  const navigate = useNavigate();

  const meals = dailyData?.meals ?? emptyMeals();
  const recordDate = dailyData?.date || selectedDateKey;

  return (
    <section className="mx-[58px] mt-[22px] pb-[126px]">
      <h2 className="text-[18px] font-semibold text-[#272932] tracking-[-0.04em]">
        기록
      </h2>

      <div className="mt-[24px] grid grid-cols-2 gap-x-[28px] gap-y-[30px]">
        {Object.entries(meals).map(([mealKey, meal]) => (
          <MealCard
          key={mealKey}
          meal={meal}
          onClick={() => {
            if (meal.mealLogId) {
              navigate(`/meal-details/${mealKey}`, {
                state: {
                  mealKey,
                  meal,
                  date: recordDate,
                },
              });
              return;
            }
        
            const searchParams = new URLSearchParams({
              mealType: meal.mealType || MEAL_KEY_TO_TYPE[mealKey],
              date: recordDate,
              source: "meal-add",
            });
            
            navigate(`/search?${searchParams.toString()}`, {
              state: {
                mealKey,
                meal,
                date: recordDate,
                source: "meal-add",
              },
            });
          }}
        />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedDate, setSelectedDate] = useState(
    () => parseDateKey(searchParams.get("date")) || today
  );

  const selectedKey = getDateKey(selectedDate);

  const currentMonth = useMemo(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
    [selectedDate]
  );

  const [dailyData, setDailyData] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const updateSelectedDate = (date, options = {}) => {
    setSelectedDate(date);

    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set("date", getDateKey(date));
        return next;
      },
      { replace: options.replace ?? false }
    );
  };

  useEffect(() => {
    const queryDate = parseDateKey(searchParams.get("date"));

    if (queryDate && getDateKey(queryDate) !== selectedKey) {
      setSelectedDate(queryDate);
    }
  }, [searchParams, selectedKey]);

  useEffect(() => {
    let ignore = false;

    async function loadDailyData() {
      setIsLoading(true);
      setError("");

      try {
        const [summary, mealLogs] = await Promise.all([
          getDailySummary(selectedKey),
          getMealLogsByDate(selectedKey),
        ]);

        if (ignore) return;

        setDailyData(toDailyDisplay(summary, mealLogs));
      } catch (loadError) {
        if (ignore) return;

        if (loadError.status === 401) {
          navigate("/login", { replace: true });
          return;
        }

        setError(loadError.message || "홈 데이터를 불러오지 못했습니다.");
        setDailyData(null);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadDailyData();

    return () => {
      ignore = true;
    };
  }, [navigate, selectedKey]);

  const handleChangeMonth = (offset) => {
    updateSelectedDate(addMonths(selectedDate, offset));
  };

  const handleSelectDate = (date) => {
    updateSelectedDate(date);
  };

  const handleOpenCalendar = () => {
    setIsCalendarOpen(true);
  };

  return (
    <MobileLayout>
      <div className="absolute inset-0 overflow-y-auto bg-white">
        <header className="pt-[58px] flex flex-col items-center">
          <p className="text-[16px] leading-none font-normal text-[#272932] tracking-[-0.02em]">
            home
          </p>

          <KkirokLogo className="mt-[5px]" />
        </header>

        <DateCarousel
          selectedDate={selectedDate}
          currentMonth={currentMonth}
          onOpenCalendar={handleOpenCalendar}
          onChangeMonth={handleChangeMonth}
          onSelectDate={handleSelectDate}
        />

        {isLoading && (
          <p className="mt-[20px] text-center text-[12px] font-light text-[#8a8c90]">
            영양 데이터를 불러오는 중입니다.
          </p>
        )}

        {error && (
          <p className="mx-[58px] mt-[20px] text-center text-[12px] font-light text-[#ff5b5b]">
            {error}
          </p>
        )}

        <WarningBox warnings={dailyData?.warnings ?? []} />

        <DonutChart data={dailyData} />

        <MealRecords dailyData={dailyData} selectedDateKey={selectedKey} />
      </div>

      <BottomNav />

      <CalendarModal
        open={isCalendarOpen}
        selectedDate={selectedDate}
        onSelect={handleSelectDate}
        onClose={() => setIsCalendarOpen(false)}
      />
    </MobileLayout>
  );
}