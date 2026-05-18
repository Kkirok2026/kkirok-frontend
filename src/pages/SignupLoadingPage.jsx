import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import KkirokLogo from "../components/common/KkirokLogo";
import BottomButton from "../components/common/BottomButton";
import { signup } from "../api/authApi";
import { addIngredientAllergies } from "../api/ingredientApi";
import { getDailySummary } from "../api/mealLogApi";
import { updateProfile } from "../api/userApi";
import {
  formatDateKey,
  genderToApi,
  targetPeriodUnitToApi,
  targetsToNutrition,
} from "../utils/mealData";

import DuckLoadingImage from "../assets/images/duck_loading.png";

function normalizeAllergyItems(allergies = []) {
  return allergies
    .map((allergy) => {
      if (typeof allergy === "string") {
        return {
          ingredientName: allergy,
          reactionNote: "주의",
        };
      }

      if (allergy.ingredientId) {
        return {
          ingredientId: allergy.ingredientId,
          reactionNote: allergy.reactionNote || "주의",
        };
      }

      const ingredientName = allergy.ingredientName || allergy.label;

      return ingredientName
        ? {
            ingredientName,
            reactionNote: allergy.reactionNote || "주의",
          }
        : null;
    })
    .filter(Boolean);
}

function fallbackNutrition(userInfo) {
  const height = Number(userInfo.height);
  const weight = Number(userInfo.weight);
  const age = Number(userInfo.age || 22);
  const goalWeight = Number(userInfo.goalWeight || weight);
  const gender = genderToApi(userInfo.gender);

  if (!height || !weight) {
    return {
      carbs: 0,
      protein: 0,
      fat: 0,
    };
  }

  const bmr =
    gender === "MALE"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
  const tdee = bmr * 1.2;
  const targetCalories =
    goalWeight < weight ? tdee - 300 : goalWeight > weight ? tdee + 300 : tdee;
  const protein = Math.round(weight * 1.2);
  const fat = Math.round((targetCalories * 0.25) / 9);
  const carbs = Math.round((targetCalories - protein * 4 - fat * 9) / 4);

  return {
    carbs: Math.max(carbs, 0),
    protein: Math.max(protein, 0),
    fat: Math.max(fat, 0),
  };
}

export default function SignupLoadingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasSubmitted = useRef(false);

  const signupState = location.state ?? {};
  const [status, setStatus] = useState("회원 정보를 저장하고 있어요");
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasSubmitted.current) return;

    hasSubmitted.current = true;

    async function submitSignup() {
      try {
        const age = Number(signupState.age);
        const heightCm = Number(signupState.height);
        const weightKg = Number(signupState.weight);
        const targetWeightKg = signupState.goalWeight
          ? Number(signupState.goalWeight)
          : null;
        const targetPeriodValue = targetWeightKg
          ? Number(signupState.periodValue || 1)
          : null;

        if (
          !signupState.email ||
          !signupState.password ||
          !signupState.name ||
          !age ||
          !heightCm ||
          !weightKg
        ) {
          throw new Error("회원가입 정보가 부족합니다. 이전 단계부터 다시 확인해주세요.");
        }

        await signup({
          email: signupState.email,
          verificationCode: signupState.verificationCode,
          password: signupState.password,
          name: signupState.name,
          age,
        });

        setStatus("건강 프로필을 저장하고 있어요");
        await updateProfile({
          gender: genderToApi(signupState.gender),
          age,
          heightCm,
          weightKg,
          targetWeightKg,
          targetPeriodValue,
          targetPeriodUnit: targetPeriodValue
            ? targetPeriodUnitToApi(signupState.periodUnit)
            : null,
          activityLevel: "LOW_ACTIVE",
        });

        const allergyItems = normalizeAllergyItems(signupState.allergies);

        if (allergyItems.length > 0) {
          setStatus("알레르기 정보를 저장하고 있어요");
          await addIngredientAllergies(allergyItems);
        }

        setStatus("맞춤 영양 기준을 불러오고 있어요");
        let nutrition = fallbackNutrition(signupState);

        try {
          const summary = await getDailySummary(formatDateKey(new Date()));
          nutrition = targetsToNutrition(summary?.recommendedTargets);
        } catch {
          nutrition = fallbackNutrition(signupState);
        }

        navigate("/signup/result", {
          replace: true,
          state: {
            ...signupState,
            nutrition,
            profileCompleted: true,
          },
        });
      } catch (submitError) {
        setError(submitError.message || "회원가입을 완료하지 못했습니다.");
      }
    }

    submitSignup();
  }, [navigate, signupState]);

  return (
    <MobileLayout>
      <header className="absolute left-0 right-0 top-[96px] flex flex-col items-center">
        <p className="text-[16px] leading-none font-normal text-[#272932] tracking-[-0.02em]">
          {error ? "Check again" : "Saving................."}
        </p>

        <KkirokLogo className="mt-[5px]" />
      </header>

      <main className="absolute left-0 right-0 top-[286px] flex flex-col items-center px-[58px] text-center">
        <img
          src={DuckLoadingImage}
          alt="영양소 계산중인 끼록 캐릭터"
          className="w-[230px] h-auto object-contain"
        />

        <p
          className="mt-[82px] font-light text-[#272932] tracking-[-0.02em]"
          style={{
            fontSize: "14px",
            lineHeight: "1.5",
          }}
        >
          {error || status}
        </p>
      </main>

      {error && (
        <BottomButton onClick={() => navigate("/signup/goal")}>
          다시 입력하기
        </BottomButton>
      )}
    </MobileLayout>
  );
}