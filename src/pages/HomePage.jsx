import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import KkirokLogo from "../components/common/KkirokLogo";
import BottomNav from "../components/layout/BottomNav";
import CalendarModal from "../components/common/CalendarModal";
import { getDailySummary, getMealLogsByDate } from "../api/mealLogApi";
import {
  MEAL_KEY_TO_TYPE,
  emptyMeals,
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
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthLabel(date) {
  return date.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function getDaysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getDayName(date) {
  return date.toLocaleString("en-US", { weekday: "short" }).slice(0, 3);
}

function DateCarousel({
  selectedDate,
  onOpenCalendar,
  currentMonth,
  onChangeMonth,
}) {
  const scrollRef = useRef(null);
  const daysInMonth = getDaysInMonth(currentMonth);

  const days = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, index) => {
      return new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        index + 1
      );
    });
  }, [currentMonth, daysInMonth]);

  useEffect(() => {
    const selectedDay = selectedDate.getDate();
    const container = scrollRef.current;

    if (!container) return;

    const cardWidth = 58;
    container.scrollTo({
      left: Math.max(0, (selectedDay - 3) * cardWidth),
      behavior: "smooth",
    });
  }, [selectedDate, currentMonth]);

  const goPrevMonth = () => {
    const nextMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1
    );

    onChangeMonth(nextMonth);
  };

  const goNextMonth = () => {
    const nextMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1
    );

    onChangeMonth(nextMonth);
  };

  return (
    <section className="mt-[44px]">
      <div className="flex items-center justify-center gap-[26px]">
        <button
          type="button"
          onClick={goPrevMonth}
          className="text-[26px] leading-none font-light text-[#a0a0a0]"
        >
          ‹
        </button>

        <p className="text-[13px] font-light text-[#9a9a9a] tracking-[-0.02em]">
          {getMonthLabel(currentMonth)}
        </p>

        <button
          type="button"
          onClick={goNextMonth}
          className="text-[26px] leading-none font-light text-[#a0a0a0]"
        >
          ›
        </button>
      </div>

      <div
        ref={scrollRef}
        className="mt-[16px] flex gap-[12px] overflow-x-auto px-[36px]"
        style={{
          scrollbarWidth: "none",
        }}
      >
        {days.map((date) => {
          const selected = getDateKey(date) === getDateKey(selectedDate);

          return (
            <button
              key={getDateKey(date)}
              type="button"
              onClick={() => onOpenCalendar(date)}
              className="shrink-0 w-[46px] h-[62px] rounded-[7px] border flex flex-col items-center justify-center transition"
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

  const totalKcal = data?.totalKcal ?? "";
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
      <h2 className="text-[20px] font-extrabold text-[#272932] tracking-[-0.04em]">
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
          <div className="absolute left-1/2 top-1/2 w-[108px] h-[108px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white flex items-center justify-center">
            <span className="text-[24px] font-extrabold text-[#6da60f] tracking-[-0.04em]">
              {hasMacroData ? `${totalKcal} kal` : ""}
            </span>
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

function MealCard({ mealKey, meal, onClick }) {
  const hasData = Boolean(meal?.mealLogId || meal?.kcal || meal?.foods?.length);

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative h-[126px] rounded-[12px] border border-[#bdb8b8] bg-white text-left px-[18px] pt-[18px]"
    >
      <span className="absolute right-[14px] top-[10px] text-[19px] font-light text-[#5f6065]">
        +
      </span>

      <p className="text-[12px] font-light text-[#272932] tracking-[-0.02em]">
        {meal?.label}
      </p>

      {hasData && (
        <>
          <p className="mt-[20px] text-[20px] font-extrabold text-[#6da60f] tracking-[-0.04em]">
            {meal.kcal} kal
          </p>

          <div className="mt-[10px] space-y-[3px]">
            <p className="text-[8px] font-light text-[#6f7075]">
              탄수화물 : {meal.carbs}g
            </p>
            <p className="text-[8px] font-light text-[#6f7075]">
              단백질 : {meal.protein}g
            </p>
            <p className="text-[8px] font-light text-[#6f7075]">
              지방 : {meal.fat}g
            </p>
          </div>
        </>
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
      <h2 className="text-[20px] font-extrabold text-[#272932] tracking-[-0.04em]">
        기록
      </h2>

      <div className="mt-[24px] grid grid-cols-2 gap-x-[28px] gap-y-[30px]">
        {Object.entries(meals).map(([mealKey, meal]) => (
          <MealCard
            key={mealKey}
            mealKey={mealKey}
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
              });

              navigate(`/search?${searchParams.toString()}`, {
                state: {
                  mealKey,
                  meal,
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
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const selectedKey = getDateKey(selectedDate);
  const [dailyData, setDailyData] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleChangeMonth = (nextMonth) => {
    setCurrentMonth(nextMonth);

    const nextDate = new Date(
      nextMonth.getFullYear(),
      nextMonth.getMonth(),
      1
    );

    setSelectedDate(nextDate);
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  const handleOpenCalendar = (date) => {
    setSelectedDate(date);
    setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
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
