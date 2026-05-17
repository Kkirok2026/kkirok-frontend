import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import KkirokLogo from "../components/common/KkirokLogo";
import BottomNavButtons from "../components/common/BottomNavButtons";

const INPUT_TEXT_STYLE = {
  fontSize: "10px",
  lineHeight: "1",
};

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
      style={{
        ...PILL_STYLE,
        backgroundColor: "#f1f0e9",
        color: "#6f7075",
      }}
      className="ml-[8px] shrink-0"
    >
      {children}
    </div>
  );
}

function ProfileInput({
  label,
  value,
  onChange,
  unit,
  required = false,
  readOnly = false,
  inputMode = "text",
}) {
  const inputRef = useRef(null);

  return (
    <div
      role="presentation"
      onClick={() => {
        if (!readOnly) inputRef.current?.focus();
      }}
      className="h-[40px] rounded-[10px] bg-[#f8f8f8] px-[13px] flex items-center cursor-text"
    >
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
        ref={inputRef}
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        readOnly={readOnly}
        style={INPUT_TEXT_STYLE}
        className={[
          "ml-[18px] w-full min-w-0 bg-transparent outline-none",
          "font-light text-[#272932]",
          "caret-[#272932]",
          readOnly ? "cursor-default" : "",
        ].join(" ")}
      />

      {unit && <UnitPill>{unit}</UnitPill>}
    </div>
  );
}

function GenderPill({ selected, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...PILL_STYLE,
        backgroundColor: selected ? "#f1f0e9" : "#ffffff",
        color: selected ? "#6f7075" : "#b8b8b8",
      }}
      className="shrink-0 transition"
    >
      {children}
    </button>
  );
}

function GenderSelector({ value, onChange }) {
  return (
    <div className="h-[40px] rounded-[10px] bg-[#f8f8f8] px-[13px] flex items-center">
      <span
        className="font-light text-[#9f9f9f] tracking-[-0.02em]"
        style={{
          fontSize: "11px",
          lineHeight: "1",
        }}
      >
        성별
      </span>

      <div className="ml-auto flex items-center gap-[6px]">
        <GenderPill
          selected={value === "male"}
          onClick={() => onChange("male")}
        >
          male
        </GenderPill>

        <GenderPill
          selected={value === "female"}
          onClick={() => onChange("female")}
        >
          female
        </GenderPill>
      </div>
    </div>
  );
}

export default function SignupProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const previousState = location.state ?? {};

  const [height, setHeight] = useState(previousState.height ?? "");
  const [weight, setWeight] = useState(previousState.weight ?? "");
  const [age, setAge] = useState(previousState.age ?? "");
  const [gender, setGender] = useState(previousState.gender ?? "female");

  const bmi = useMemo(() => {
    const heightNumber = Number(height);
    const weightNumber = Number(weight);

    if (!heightNumber || !weightNumber) return "";

    const heightMeter = heightNumber / 100;
    const calculatedBmi = weightNumber / (heightMeter * heightMeter);

    if (!Number.isFinite(calculatedBmi)) return "";

    return calculatedBmi.toFixed(1);
  }, [height, weight]);

  const handleHeightChange = (value) => {
    setHeight(value.replace(/[^\d.]/g, ""));
  };

  const handleWeightChange = (value) => {
    setWeight(value.replace(/[^\d.]/g, ""));
  };

  const handleAgeChange = (value) => {
    setAge(value.replace(/[^\d]/g, ""));
  };

  const canGoNext = height.trim().length > 0 && weight.trim().length > 0;

  const handlePrev = () => {
    navigate("/signup/create", {
      state: {
        ...previousState,
        height,
        weight,
        age,
        bmi,
        gender,
      },
    });
  };

  const handleNext = () => {
    if (!canGoNext) return;

    navigate("/signup/allergy", {
      state: {
        ...previousState,
        height,
        weight,
        age,
        bmi,
        gender,
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

      <main className="absolute left-[58px] right-[58px] top-[286px]">
        <ProfileInput
          label="키"
          value={height}
          onChange={handleHeightChange}
          unit="cm"
          required
          inputMode="decimal"
        />

        <div className="mt-[18px]">
          <ProfileInput
            label="몸무게"
            value={weight}
            onChange={handleWeightChange}
            unit="kg"
            required
            inputMode="decimal"
          />
        </div>

        <div className="mt-[18px]">
          <ProfileInput
            label="나이"
            value={age}
            onChange={handleAgeChange}
            inputMode="numeric"
          />
        </div>

        <div className="mt-[18px]">
          <ProfileInput
            label="BMI(자동)"
            value={bmi}
            readOnly
          />
        </div>

        <div className="mt-[18px]">
          <GenderSelector value={gender} onChange={setGender} />
        </div>
      </main>

      <BottomNavButtons onPrev={handlePrev} onNext={handleNext} />
    </MobileLayout>
  );
}