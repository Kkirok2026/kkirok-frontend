import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import KkirokLogo from "../components/common/KkirokLogo";
import BottomNavButtons from "../components/common/BottomNavButtons";
import {
  addAllergy,
  deleteAllergy,
  getAllergies,
  getMe,
  updateProfile,
} from "../api/userApi";
import { genderToApi, targetPeriodUnitToApi } from "../utils/mealData";

const LABEL_STYLE = {
  fontSize: "11px",
  lineHeight: "1",
  fontWeight: 300,
};

const VALUE_STYLE = {
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

function csvToNames(value) {
  return `${value ?? ""}`
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function UnitPill({ children }) {
  return (
    <span
      className="ml-[8px] shrink-0"
      style={{
        ...PILL_STYLE,
        backgroundColor: "#f1f0e9",
        color: "#6f7075",
      }}
    >
      {children}
    </span>
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
        border: selected ? "none" : "1px solid #f1f0e9",
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
    <div
      className="rounded-[10px] bg-[#f8f8f8] px-[13px] flex items-center"
      style={{ height: "44px" }}
    >
      <span
        className="shrink-0 text-[#9f9f9f] tracking-[-0.02em]"
        style={LABEL_STYLE}
      >
        {label}
        {required && <span className="ml-[1px] text-[#ff7b45]">*</span>}
      </span>

      <input
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="ml-[18px] min-w-0 flex-1 bg-transparent text-[#272932] outline-none caret-[#272932]"
        style={VALUE_STYLE}
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
  const [allergyText, setAllergyText] = useState(
    previousState.allergyText ?? ""
  );
  const [activityLevel, setActivityLevel] = useState(
    previousState.activityLevel ?? "LOW_ACTIVE"
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
        setPeriodValue(
          `${profile.targetPeriodValue ?? (profile.targetWeightKg ? 1 : "")}`
        );
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
      const targetPeriodValue = targetWeight ? Number(periodValue || 1) : null;

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

      navigate("/profile", {
        replace: true,
        state: { refreshedAt: Date.now() },
      });
    } catch (saveError) {
      if (saveError.status === 401) {
        navigate("/login", { replace: true });
        return;
      }

      setError(saveError.message || "프로필을 저장하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
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

      <p
        className="absolute left-0 right-0 top-[238px] text-center text-[#272932] tracking-[-0.02em]"
        style={{
          fontSize: "14px",
          lineHeight: "18px",
          fontWeight: 300,
        }}
      >
        목표를 입력해주세요
      </p>

      <main className="absolute left-[33px] right-[34px] top-[326px]">
        {error && (
          <p className="mb-[10px] text-center text-[11px] text-[#ff5b5b]">
            {error}
          </p>
        )}

        <GoalInput
          label="몸무게"
          required
          value={targetWeight}
          onChange={(value) => {
            setTargetWeight(cleanDecimal(value));
            setError("");
          }}
          unit="kg"
          inputMode="decimal"
        />

        <div className="mt-[22px]">
          <GoalInput
            label="기간(Days)"
            value={periodValue}
            onChange={(value) => {
              setPeriodValue(cleanInteger(value));
              setError("");
            }}
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
        onNext={handleSave}
        prevText="이전"
        nextText={isSaving ? "수정 중" : "수정"}
        bottomClassName="bottom-[40px]"
      />
    </MobileLayout>
  );
}