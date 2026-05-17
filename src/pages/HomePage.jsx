import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import KkirokLogo from "../components/common/KkirokLogo";

import HomeActiveIcon from "../assets/icons/Home-ac.svg";
import SearchIcon from "../assets/icons/Search-inac.svg";
import MealIcon from "../assets/icons/Meal-inac.svg";
import ProfileIcon from "../assets/icons/Profile-inac.svg";
import DuckNavIcon from "../assets/images/duck_navi.png";

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

const todayKey = getDateKey(today);

const DEFAULT_DAILY_DATA = {
  [todayKey]: {
    totalKcal: 1260,
    macros: {
      protein: 75,
      fat: 80,
      carbs: 280,
    },
    meals: {
      breakfast: {
        label: "아침",
        kcal: 760,
        carbs: 80,
        protein: 80,
        fat: 80,
      },
      lunch: {
        label: "점심",
        kcal: 1260,
        carbs: 80,
        protein: 80,
        fat: 80,
      },
      dinner: {
        label: "저녁",
        kcal: 860,
        carbs: 80,
        protein: 80,
        fat: 80,
      },
      snack: {
        label: "간식",
        kcal: 76,
        carbs: 80,
        protein: 80,
        fat: 80,
      },
    },
  },
};

function DateCarousel({ selectedDate, onSelectDate, currentMonth, onChangeMonth }) {
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
              onClick={() => onSelectDate(date)}
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

function WarningBox() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

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
        어제 너무 탄수화물 위주였어요
        <br />
        탄수화물을 지양한 음식을 섭취해주세요
      </p>
    </section>
  );
}

function DonutChart({ data }) {
  const hasData = Boolean(data);

  const totalKcal = data?.totalKcal ?? "";
  const protein = data?.macros?.protein ?? 0;
  const fat = data?.macros?.fat ?? 0;
  const carbs = data?.macros?.carbs ?? 0;

  const totalMacro = protein + fat + carbs;

  const proteinRatio = totalMacro ? (protein / totalMacro) * 100 : 0;
  const fatRatio = totalMacro ? (fat / totalMacro) * 100 : 0;

  const gradient = hasData
    ? `conic-gradient(
        ${MACRO_COLORS.protein} 0 ${proteinRatio}%,
        ${MACRO_COLORS.fat} ${proteinRatio}% ${proteinRatio + fatRatio}%,
        ${MACRO_COLORS.carbs} ${proteinRatio + fatRatio}% 100%
      )`
    : `conic-gradient(${MACRO_COLORS.empty} 0 100%)`;

  return (
    <section className="mx-[58px] mt-[24px]">
      <h2 className="text-[20px] font-extrabold text-[#272932] tracking-[-0.04em]">
        나의 하루 영양
      </h2>

      <div className="relative mt-[30px] h-[260px] flex items-center justify-center">
        <div
          className="relative w-[202px] h-[202px] rounded-full"
          style={{ background: gradient }}
        >
          <div className="absolute left-1/2 top-1/2 w-[108px] h-[108px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white flex items-center justify-center">
            <span className="text-[24px] font-extrabold text-[#6da60f] tracking-[-0.04em]">
              {hasData ? `${totalKcal} kal` : ""}
            </span>
          </div>
        </div>

        {hasData && (
          <>
            <div className="absolute left-[42px] top-[6px] w-[70px] h-[70px] rounded-full bg-white shadow-[0_10px_22px_rgba(0,0,0,0.18)] flex flex-col items-center justify-center">
              <span className="text-[10px] font-light text-[#777]">단백질</span>
              <span className="mt-[4px] text-[22px] font-extrabold text-[#272932]">
                {protein}g
              </span>
            </div>

            <div className="absolute right-[16px] top-[28px] w-[70px] h-[70px] rounded-full bg-white shadow-[0_10px_22px_rgba(0,0,0,0.18)] flex flex-col items-center justify-center">
              <span className="text-[10px] font-light text-[#777]">지방</span>
              <span className="mt-[4px] text-[22px] font-extrabold text-[#272932]">
                {fat}g
              </span>
            </div>

            <div className="absolute left-[22px] bottom-[10px] w-[78px] h-[78px] rounded-full bg-white shadow-[0_10px_22px_rgba(0,0,0,0.18)] flex flex-col items-center justify-center">
              <span className="text-[10px] font-light text-[#777]">탄수화물</span>
              <span className="mt-[4px] text-[22px] font-extrabold text-[#272932]">
                {carbs}g
              </span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function MealCard({ mealKey, meal, onClick }) {
  const hasData = Boolean(meal?.kcal);

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

function MealRecords({ dailyData }) {
  const navigate = useNavigate();

  const meals = dailyData?.meals ?? {
    breakfast: { label: "아침" },
    lunch: { label: "점심" },
    dinner: { label: "저녁" },
    snack: { label: "간식" },
  };

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
            onClick={() =>
              navigate(`/meal-details/${mealKey}`, {
                state: {
                  mealKey,
                  meal,
                },
              })
            }
          />
        ))}
      </div>
    </section>
  );
}

function BottomNav() {
  return (
    <nav className="absolute left-0 right-0 bottom-0 h-[76px] bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.04)] flex items-center justify-around px-[24px]">
      <img src={HomeActiveIcon} alt="홈" className="w-[25px] h-[25px]" />
      <img src={SearchIcon} alt="검색" className="w-[25px] h-[25px]" />
      <img
        src={DuckNavIcon}
        alt="끼록"
        className="w-[50px] h-[50px] object-contain self-end"
      />
      <img src={MealIcon} alt="식단" className="w-[25px] h-[25px]" />
      <img src={ProfileIcon} alt="프로필" className="w-[25px] h-[25px]" />
    </nav>
  );
}

export default function HomePage() {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(today);

  const selectedKey = getDateKey(selectedDate);
  const dailyData = DEFAULT_DAILY_DATA[selectedKey];

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
          onSelectDate={handleSelectDate}
          onChangeMonth={handleChangeMonth}
        />

        <WarningBox />

        <DonutChart data={dailyData} />

        <MealRecords dailyData={dailyData} />
      </div>

      <BottomNav />
    </MobileLayout>
  );
}