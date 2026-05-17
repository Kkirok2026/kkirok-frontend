import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import KkirokLogo from "../components/common/KkirokLogo";

import DuckLoadingImage from "../assets/images/duck_loading.png";

function calculateNutrition(userInfo) {
  const height = Number(userInfo.height);
  const weight = Number(userInfo.weight);
  const age = Number(userInfo.age || 22);
  const goalWeight = Number(userInfo.goalWeight || weight);
  const gender = userInfo.gender || "female";

  if (!height || !weight) {
    return {
      carbs: 280,
      protein: 75,
      fat: 80,
    };
  }

  const bmr =
    gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  const tdee = bmr * 1.2;

  let targetCalories = tdee;

  if (goalWeight < weight) {
    targetCalories -= 300;
  } else if (goalWeight > weight) {
    targetCalories += 300;
  }

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

  const signupState = location.state ?? {};

  useEffect(() => {
    const nutrition = calculateNutrition(signupState);

    const timer = window.setTimeout(() => {
      navigate("/signup/result", {
        replace: true,
        state: {
          ...signupState,
          nutrition,
        },
      });
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [navigate, signupState]);

  return (
    <MobileLayout>
      <header className="absolute left-0 right-0 top-[96px] flex flex-col items-center">
        <p className="text-[16px] leading-none font-normal text-[#272932] tracking-[-0.02em]">
          Guessing.................
        </p>

        <KkirokLogo className="mt-[5px]" />
      </header>

      <main className="absolute left-0 right-0 top-[286px] flex flex-col items-center">
        <img
          src={DuckLoadingImage}
          alt="영양소 계산중인 끼록 캐릭터"
          className="w-[230px] h-auto object-contain"
        />

        <p
          className="mt-[82px] font-light text-[#272932] tracking-[-0.02em]"
          style={{
            fontSize: "14px",
            lineHeight: "1",
          }}
        >
          알맞은 영양소 섭취 계산중
        </p>
      </main>
    </MobileLayout>
  );
}