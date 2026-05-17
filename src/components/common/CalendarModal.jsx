import { useEffect, useMemo, useState } from "react";

import { formatDateKey } from "../../utils/mealData";

function monthLabel(date) {
  return date.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function getMonthDays(date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const daysInMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();

  return [
    ...Array.from({ length: firstDay.getDay() }, (_, index) => ({
      key: `blank-${index}`,
      date: null,
    })),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      return {
        key: `${date.getFullYear()}-${date.getMonth()}-${day}`,
        date: new Date(date.getFullYear(), date.getMonth(), day),
      };
    }),
  ];
}

export default function CalendarModal({ open, selectedDate, onSelect, onClose }) {
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  useEffect(() => {
    if (!open) return;
    setVisibleMonth(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    );
  }, [open, selectedDate]);

  const days = useMemo(() => getMonthDays(visibleMonth), [visibleMonth]);
  const selectedKey = formatDateKey(selectedDate);

  if (!open) return null;

  const moveMonth = (offset) => {
    setVisibleMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1)
    );
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/25 px-[24px] pb-[112px]">
      <section className="w-full max-w-[382px] rounded-[18px] bg-white px-[22px] py-[20px] shadow-[0_18px_34px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            className="h-[34px] w-[34px] rounded-full text-[24px] leading-none text-[#8a8c90]"
          >
            ‹
          </button>

          <p className="text-[15px] font-bold text-[#272932]">
            {monthLabel(visibleMonth)}
          </p>

          <button
            type="button"
            onClick={() => moveMonth(1)}
            className="h-[34px] w-[34px] rounded-full text-[24px] leading-none text-[#8a8c90]"
          >
            ›
          </button>
        </div>

        <div className="mt-[18px] grid grid-cols-7 gap-y-[8px] text-center">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <span
              key={`${day}-${index}`}
              className="text-[11px] font-light text-[#a0a0a0]"
            >
              {day}
            </span>
          ))}

          {days.map((item) => {
            if (!item.date) {
              return <span key={item.key} className="h-[38px]" />;
            }

            const isSelected = formatDateKey(item.date) === selectedKey;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onSelect(item.date);
                  onClose();
                }}
                className={[
                  "mx-auto h-[38px] w-[38px] rounded-full text-[13px] transition",
                  isSelected
                    ? "bg-[#9bd322] font-bold text-white"
                    : "text-[#272932] hover:bg-[#f3f4f0]",
                ].join(" ")}
              >
                {item.date.getDate()}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-[18px] h-[38px] w-full rounded-[10px] bg-[#f8f8f8] text-[13px] font-bold text-[#272932]"
        >
          닫기
        </button>
      </section>
    </div>
  );
}
