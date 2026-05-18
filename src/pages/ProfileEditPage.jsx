import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import KkirokLogo from "../components/common/KkirokLogo";
import BottomNavButtons from "../components/common/BottomNavButtons";
import { getAllergies, getMe } from "../api/userApi";

const INPUT_LABEL_STYLE = {
  fontSize: "11px",
  lineHeight: "1",
  fontWeight: 300,
};

const INPUT_VALUE_STYLE = {
  fontSize: "10px",
  lineHeight: "1",
  fontWeight: 300,
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

function cleanDecimal(value) {
  return `${value ?? ""}`.replace(/[^\d.]/g, "");
}

function cleanInteger(value) {
  return `${value ?? ""}`.replace(/[^\d]/g, "");
}

function UnitPill({ children }) {
  return (
    <span
      style={{
        ...PILL_STYLE,
        backgroundColor: "#f1f0e9",
        color: "#6f7075",
      }}
      className="ml-[8px] shrink-0"
    >
      {children}
    </span>
  );
}

function EditInput({
  label,
  value,
  onChange,
  unit,
  required = false,
  readOnly = false,
  inputMode = "text",
}) {
  return (
    <div
      className="rounded-[10px] bg-[#f8f8f8] px-[13px] flex items-center"
      style={{
        height: "44px",
      }}
    >
      <span
        className="shrink-0 text-[#9f9f9f] tracking-[-0.02em]"
        style={INPUT_LABEL_STYLE}
      >
        {label}
        {required && <span className="ml-[1px] text-[#ff7b45]">*</span>}
      </span>

      <input
        type="text"
        inputMode={inputMode}
        value={value}
        readOnly={readOnly}
        onChange={(event) => onChange?.(event.target.value)}
        className={[
          "ml-[18px] min-w-0 flex-1 bg-transparent outline-none",
          "text-[#272932] caret-[#272932]",
          readOnly ? "text-[#8a8c90]" : "",
        ].join(" ")}
        style={INPUT_VALUE_STYLE}
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
        border: selected ? "none" : "1px solid #f1f0e9",
      }}
      className="shrink-0 transition"
    >
      {children}
    </button>
  );
}

function GenderSelector({ value, onChange }) {
  return (
    <div
      className="rounded-[10px] bg-[#f8f8f8] px-[13px] flex items-center"
      style={{
        height: "44px",
      }}
    >
      <span
        className="shrink-0 text-[#9f9f9f] tracking-[-0.02em]"
        style={INPUT_LABEL_STYLE}
      >
        성별
      </span>

      <div className="ml-auto flex items-center gap-[6px]">
        <GenderPill
          selected={value === "MALE"}
          onClick={() => onChange("MALE")}
        >
          male
        </GenderPill>

        <GenderPill
          selected={value === "FEMALE"}
          onClick={() => onChange("FEMALE")}
        >
          female
        </GenderPill>
      </div>
    </div>
  );
}

function allergyLabel(items) {
  return items.map((allergy) => allergy.name).filter(Boolean).join(", ");
}

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const previousState = location.state ?? {};
  const hasPreviousState = Object.keys(previousState).length > 0;

  const [allergies, setAllergies] = useState(previousState.allergies ?? []);
  const [height, setHeight] = useState(previousState.height ?? "");
  const [weight, setWeight] = useState(previousState.weight ?? "");
  const [age, setAge] = useState(previousState.age ?? "");
  const [gender, setGender] = useState(previousState.gender ?? "FEMALE");
  const [allergyText, setAllergyText] = useState(
    previousState.allergyText ?? ""
  );
  const [targetWeight, setTargetWeight] = useState(
    previousState.targetWeight ?? ""
  );
  const [periodValue, setPeriodValue] = useState(
    previousState.periodValue ?? "1"
  );
  const [periodUnit, setPeriodUnit] = useState(
    previousState.periodUnit ?? "month"
  );
  const [activityLevel, setActivityLevel] = useState(
    previousState.activityLevel ?? "LOW_ACTIVE"
  );
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      try {
        const [meResponse, allergyResponse] = await Promise.all([
          getMe(),
          getAllergies(),
        ]);

        if (ignore) return;

        const profile = meResponse?.profile || {};
        const allergyItems = allergyResponse?.items ?? [];

        setAllergies(allergyItems);

        if (hasPreviousState) return;

        setHeight(`${profile.heightCm ?? ""}`);
        setWeight(`${profile.weightKg ?? ""}`);
        setAge(`${meResponse?.age ?? ""}`);
        setGender(profile.gender || "FEMALE");
        setAllergyText(allergyLabel(allergyItems));
        setTargetWeight(`${profile.targetWeightKg ?? ""}`);
        setPeriodValue(
          `${profile.targetPeriodValue ?? (profile.targetWeightKg ? 1 : "")}`
        );
        setPeriodUnit(profile.targetPeriodUnit === "WEEK" ? "week" : "month");
        setActivityLevel(profile.activityLevel || "LOW_ACTIVE");
      } catch (loadError) {
        if (ignore) return;

        if (loadError.status === 401) {
          navigate("/login", { replace: true });
          return;
        }

        setError(loadError.message || "프로필을 불러오지 못했습니다.");
      }
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, [hasPreviousState, navigate]);

  const bmi = useMemo(() => {
    const heightNumber = Number(height);
    const weightNumber = Number(weight);

    if (!heightNumber || !weightNumber) return "";

    const heightMeter = heightNumber / 100;
    const result = weightNumber / (heightMeter * heightMeter);

    return Number.isFinite(result) ? result.toFixed(1) : "";
  }, [height, weight]);

  const handleNext = () => {
    if (!height || !weight || !age) {
      setError("키, 몸무게, 나이를 입력해주세요.");
      return;
    }

    navigate("/profile/edit/goal", {
      state: {
        allergies,
        height,
        weight,
        age,
        gender,
        allergyText,
        targetWeight,
        periodValue,
        periodUnit,
        activityLevel,
      },
    });
  };

  return (
    <MobileLayout>
      <header className="absolute left-0 right-0 top-[88px] flex flex-col items-center">
        <p
          className="text-[#1d1617] tracking-[-0.02em]"
          style={{
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: "14px",
            lineHeight: "17px",
            fontWeight: 400,
          }}
        >
          modify account
        </p>

        <KkirokLogo className="mt-[2px]" />
      </header>

      <main className="absolute left-[33px] right-[34px] top-[270px]">
        {error && (
          <p className="mb-[10px] text-center text-[11px] text-[#ff5b5b]">
            {error}
          </p>
        )}

        <EditInput
          label="키"
          value={height}
          onChange={(value) => {
            setHeight(cleanDecimal(value));
            setError("");
          }}
          unit="cm"
          required
          inputMode="decimal"
        />

        <div className="mt-[13px]">
          <EditInput
            label="몸무게"
            value={weight}
            onChange={(value) => {
              setWeight(cleanDecimal(value));
              setError("");
            }}
            unit="kg"
            required
            inputMode="decimal"
          />
        </div>

        <div className="mt-[13px]">
          <EditInput
            label="나이"
            value={age}
            onChange={(value) => {
              setAge(cleanInteger(value));
              setError("");
            }}
            inputMode="numeric"
          />
        </div>

        <div className="mt-[13px]">
          <EditInput label="BMI(자동)" value={bmi} readOnly />
        </div>

        <div className="mt-[13px]">
          <GenderSelector value={gender} onChange={setGender} />
        </div>

        <div className="mt-[13px]">
          <EditInput
            label="알레르기"
            value={allergyText}
            onChange={setAllergyText}
          />
        </div>
      </main>

      <BottomNavButtons
        onPrev={() => navigate("/profile")}
        onNext={handleNext}
        prevText="이전"
        nextText="다음"
        bottomClassName="bottom-[24px]"
      />
    </MobileLayout>
  );
}