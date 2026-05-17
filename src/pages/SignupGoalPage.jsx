import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import KkirokLogo from "../components/common/KkirokLogo";
import BottomNavButtons from "../components/common/BottomNavButtons";

const PILL_STYLE = {
  height: "26px",
  minWidth: "58px",
  borderRadius: "999px",
  padding: "0 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "12px",
  lineHeight: "1",
  fontWeight: 300,
};

function UnitPill({ children }) {
  return (
    <div
      className="ml-[8px] shrink-0"
      style={{
        ...PILL_STYLE,
        backgroundColor: "#f1f0e9",
        color: "#6f7075",
      }}
    >
      {children}
    </div>
  );
}

function SelectPill({ selected, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 transition"
      style={{
        ...PILL_STYLE,
        backgroundColor: selected ? "#f1f0e9" : "#ffffff",
        color: selected ? "#6f7075" : "#b8b8b8",
      }}
    >
      {children}
    </button>
  );
}

function GoalInput({
  label,
  required = false,
  value,
  onChange,
  unit,
  children,
  inputMode = "text",
}) {
  return (
    <div className="h-[40px] rounded-[10px] bg-[#f8f8f8] px-[13px] flex items-center">
      <span
        className="shrink-0 font-light text-[#9f9f9f] tracking-[-0.02em]"
        style={{
          fontSize: "11px",
          lineHeight: "1",
        }}
      >
        {label}
        {required && <span className="ml-[1px] text-[#ff7b45]">*</span>}
      </span>

      <input
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="ml-[18px] w-full min-w-0 bg-transparent outline-none font-light text-[#272932] caret-[#272932]"
        style={{
          fontSize: "10px",
          lineHeight: "1",
        }}
      />

      {unit && <UnitPill>{unit}</UnitPill>}
      {children}
    </div>
  );
}

export default function SignupGoalPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const previousState = location.state ?? {};

  const [goalWeight, setGoalWeight] = useState(previousState.goalWeight ?? "");
  const [periodValue, setPeriodValue] = useState(previousState.periodValue ?? "");
  const [periodUnit, setPeriodUnit] = useState(previousState.periodUnit ?? "month");

  const canSubmit = goalWeight.trim().length > 0;

  const handleGoalWeightChange = (value) => {
    setGoalWeight(value.replace(/[^\d.]/g, ""));
  };

  const handlePeriodValueChange = (value) => {
    setPeriodValue(value.replace(/[^\d]/g, ""));
  };

  const handlePrev = () => {
    navigate("/signup/allergy", {
      state: {
        ...previousState,
        goalWeight,
        periodValue,
        periodUnit,
      },
    });
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    navigate("/signup/loading", {
      state: {
        ...previousState,
        goalWeight,
        periodValue,
        periodUnit,
      },
    });
  };

  return (
    <MobileLayout>
      <header className="absolute left-0 right-0 top-[96px] flex flex-col items-center">
        <p className="text-[16px] leading-none font-normal text-[#272932] tracking-[-0.02em]">
          Create account
        </p>

        <KkirokLogo className="mt-[5px]" />
      </header>

      <p
        className="absolute left-0 right-0 top-[272px] text-center font-light text-[#272932] tracking-[-0.02em]"
        style={{
          fontSize: "13px",
          lineHeight: "1",
        }}
      >
        목표를 입력해주세요
      </p>

      <main className="absolute left-[58px] right-[58px] top-[376px]">
        <GoalInput
          label="몸무게"
          required
          value={goalWeight}
          onChange={handleGoalWeightChange}
          unit="kg"
          inputMode="decimal"
        />

        <div className="mt-[18px]">
          <GoalInput
            label="기간(Days)"
            value={periodValue}
            onChange={handlePeriodValueChange}
            inputMode="numeric"
          >
            <div className="ml-auto flex items-center gap-[6px]">
              <SelectPill
                selected={periodUnit === "month"}
                onClick={() => setPeriodUnit("month")}
              >
                month
              </SelectPill>

              <SelectPill
                selected={periodUnit === "week"}
                onClick={() => setPeriodUnit("week")}
              >
                week
              </SelectPill>
            </div>
          </GoalInput>
        </div>
      </main>

      <BottomNavButtons
        onPrev={handlePrev}
        onNext={handleSubmit}
        prevText="이전"
        nextText="가입"
      />
    </MobileLayout>
  );
}