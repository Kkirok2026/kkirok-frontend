import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import KkirokLogo from "../components/common/KkirokLogo";
import BottomNavButtons from "../components/common/BottomNavButtons";
import BottomNav from "../components/layout/BottomNav";
import {
  addAllergy,
  deleteAllergy,
  getAllergies,
  getMe,
  updateProfile,
} from "../api/userApi";
import { genderToApi, targetPeriodUnitToApi } from "../utils/mealData";

const PILL_STYLE = {
  height: "28px",
  minWidth: "84px",
  borderRadius: "999px",
  padding: "0 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "16px",
  lineHeight: "1",
  fontWeight: 300,
};

function cleanDecimal(value) {
  return `${value ?? ""}`.replace(/[^\d.]/g, "");
}

function cleanInteger(value) {
  return `${value ?? ""}`.replace(/[^\d]/g, "");
}

function csvToNames(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

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
    <div className="h-[48px] rounded-[14px] border border-[#f7f8f8] bg-[#f7f8f8] px-[15px] flex items-center">
      <span className="shrink-0 text-[16px] text-[#8a8c90]">
        {label}
        {required && <span className="text-[#ff7b45]">*</span>}
      </span>

      <input
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="ml-[18px] min-w-0 flex-1 bg-transparent text-[16px] text-[#272932] outline-none"
      />

      {unit && <UnitPill>{unit}</UnitPill>}
      {children}
    </div>
  );
}

export default function ProfileGoalEditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const previousState = location.state ?? {};

  const [allergies, setAllergies] = useState(previousState.allergies ?? []);
  const [height, setHeight] = useState(previousState.height ?? "");
  const [weight, setWeight] = useState(previousState.weight ?? "");
  const [age, setAge] = useState(previousState.age ?? "");
  const [gender, setGender] = useState(previousState.gender ?? "FEMALE");
  const [allergyText, setAllergyText] = useState(previousState.allergyText ?? "");
  const [activityLevel, setActivityLevel] = useState(
    previousState.activityLevel ?? "LOW_ACTIVE"
  );
  const [targetWeight, setTargetWeight] = useState(
    previousState.targetWeight ?? ""
  );
  const [periodValue, setPeriodValue] = useState(
    previousState.periodValue ?? ""
  );
  const [periodUnit, setPeriodUnit] = useState(previousState.periodUnit ?? "month");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (height && weight && age) return;

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
        setHeight(`${profile.heightCm ?? ""}`);
        setWeight(`${profile.weightKg ?? ""}`);
        setAge(`${meResponse?.age ?? ""}`);
        setGender(profile.gender || "FEMALE");
        setAllergyText(allergyItems.map((allergy) => allergy.name).join(", "));
        setActivityLevel(profile.activityLevel || "LOW_ACTIVE");
        setTargetWeight(`${profile.targetWeightKg ?? ""}`);
        setPeriodValue(`${profile.targetPeriodValue ?? ""}`);
        setPeriodUnit(profile.targetPeriodUnit === "WEEK" ? "week" : "month");
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
  }, [age, height, navigate, weight]);

  const handlePrev = () => {
    navigate("/profile/edit", {
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

  const handleSave = async () => {
    if (!height || !weight || !age || isSaving) {
      setError("프로필 정보를 입력해주세요.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const targetPeriodValue = periodValue ? Number(periodValue) : null;

      await updateProfile({
        gender: genderToApi(gender),
        age: Number(age),
        heightCm: Number(height),
        weightKg: Number(weight),
        targetWeightKg: targetWeight ? Number(targetWeight) : null,
        targetPeriodValue,
        targetPeriodUnit: targetPeriodValue
          ? targetPeriodUnitToApi(periodUnit)
          : null,
        activityLevel,
      });

      const nextNames = csvToNames(allergyText);
      const currentNames = allergies.map((allergy) => allergy.name);
      const nextNameSet = new Set(nextNames);
      const currentNameSet = new Set(currentNames);

      await Promise.all(
        allergies
          .filter(
            (allergy) =>
              allergy.allergyId && !nextNameSet.has(allergy.name)
          )
          .map((allergy) => deleteAllergy(allergy.allergyId))
      );

      await Promise.all(
        nextNames
          .filter((name) => !currentNameSet.has(name))
          .map((name) =>
            addAllergy({
              allergyType: "INGREDIENT",
              ingredientName: name,
              reactionNote: "주의",
            })
          )
      );

      navigate("/profile");
    } catch (saveError) {
      setError(saveError.message || "프로필을 저장하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MobileLayout>
      <header className="absolute left-0 right-0 top-[83px] flex flex-col items-center">
        <p className="text-[16px] leading-[24px] text-[#1d1617]">
          Create account
        </p>
        <KkirokLogo className="mt-[-2px]" />
      </header>

      <p className="absolute left-0 right-0 top-[292px] text-center text-[18px] font-light text-[#272932] tracking-[-0.02em]">
        목표를 입력해주세요
      </p>

      <main className="absolute left-[33px] right-[34px] top-[437px] space-y-[21px]">
        {error && (
          <p className="text-center text-[12px] text-[#ff5b5b]">{error}</p>
        )}

        <GoalInput
          label="몸무게"
          required
          value={targetWeight}
          onChange={(value) => setTargetWeight(cleanDecimal(value))}
          unit="kg"
          inputMode="decimal"
        />

        <GoalInput
          label="기간(Days)"
          value={periodValue}
          onChange={(value) => setPeriodValue(cleanInteger(value))}
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
      </main>

      <BottomNavButtons
        onPrev={handlePrev}
        onNext={handleSave}
        prevText="이전"
        nextText={isSaving ? "수정 중" : "수정"}
        bottomClassName="bottom-[112px]"
      />

      <BottomNav />
    </MobileLayout>
  );
}
