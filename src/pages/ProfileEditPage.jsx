import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import KkirokLogo from "../components/common/KkirokLogo";
import BottomNavButtons from "../components/common/BottomNavButtons";
import BottomNav from "../components/layout/BottomNav";
import { getAllergies, getMe } from "../api/userApi";

function cleanDecimal(value) {
  return `${value ?? ""}`.replace(/[^\d.]/g, "");
}

function cleanInteger(value) {
  return `${value ?? ""}`.replace(/[^\d]/g, "");
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
    <div className="h-[48px] rounded-[14px] border border-[#f7f8f8] bg-[#f7f8f8] px-[15px] flex items-center">
      <span className="shrink-0 text-[16px] text-[#8a8c90]">
        {label}
        {required && <span className="text-[#ff7b45]">*</span>}
      </span>
      <input
        type="text"
        inputMode={inputMode}
        value={value}
        readOnly={readOnly}
        onChange={(event) => onChange?.(event.target.value)}
        className="ml-[18px] min-w-0 flex-1 bg-transparent text-[16px] text-[#272932] outline-none read-only:text-[#8a8c90]"
      />
      {unit && (
        <span className="ml-[8px] flex h-[28px] min-w-[84px] items-center justify-center rounded-full bg-[#f1f0e8] text-[16px] text-[#666]">
          {unit}
        </span>
      )}
    </div>
  );
}

function SegmentedButton({ selected, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-[28px] min-w-[84px] rounded-full px-[14px] text-[12px] transition",
        selected ? "bg-[#f1f0e8] text-[#666]" : "bg-[#fefcfb] text-[#a9abaf]",
      ].join(" ")}
    >
      {children}
    </button>
  );
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
  const [allergyText, setAllergyText] = useState(previousState.allergyText ?? "");
  const [targetWeight, setTargetWeight] = useState(
    previousState.targetWeight ?? ""
  );
  const [periodValue, setPeriodValue] = useState(
    previousState.periodValue ?? ""
  );
  const [periodUnit, setPeriodUnit] = useState(previousState.periodUnit ?? "month");
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
        setAllergyText(allergyItems.map((allergy) => allergy.name).join(", "));
        setTargetWeight(`${profile.targetWeightKg ?? ""}`);
        setPeriodValue(`${profile.targetPeriodValue ?? ""}`);
        setPeriodUnit(
          profile.targetPeriodUnit === "WEEK" ? "week" : "month"
        );
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
      <header className="absolute left-0 right-0 top-[83px] flex flex-col items-center">
        <p className="text-[16px] leading-[24px] text-[#1d1617]">
          Create account
        </p>
        <KkirokLogo className="mt-[-2px]" />
      </header>

      <main className="absolute left-[33px] right-[34px] top-[337px] space-y-[15px]">
        {error && (
          <p className="text-center text-[12px] text-[#ff5b5b]">{error}</p>
        )}

        <EditInput
          label="키"
          value={height}
          onChange={(value) => setHeight(cleanDecimal(value))}
          unit="cm"
          required
          inputMode="decimal"
        />
        <EditInput
          label="몸무게"
          value={weight}
          onChange={(value) => setWeight(cleanDecimal(value))}
          unit="kg"
          required
          inputMode="decimal"
        />
        <EditInput
          label="나이"
          value={age}
          onChange={(value) => setAge(cleanInteger(value))}
          inputMode="numeric"
        />
        <EditInput label="BMI(자동)" value={bmi} readOnly />

        <div className="h-[48px] rounded-[14px] border border-[#f7f8f8] bg-[#f7f8f8] px-[15px] flex items-center">
          <span className="text-[16px] text-[#8a8c90]">성별</span>
          <div className="ml-auto flex gap-[6px]">
            <SegmentedButton
              selected={gender === "MALE"}
              onClick={() => setGender("MALE")}
            >
              male
            </SegmentedButton>
            <SegmentedButton
              selected={gender === "FEMALE"}
              onClick={() => setGender("FEMALE")}
            >
              female
            </SegmentedButton>
          </div>
        </div>

        <EditInput
          label="알레르기"
          value={allergyText}
          onChange={setAllergyText}
        />
      </main>

      <BottomNavButtons
        onPrev={() => navigate("/profile")}
        onNext={handleNext}
        bottomClassName="bottom-[112px]"
      />

      <BottomNav />
    </MobileLayout>
  );
}
