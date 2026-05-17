import { useLocation, useNavigate } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import KkirokLogo from "../components/common/KkirokLogo";

import DuckResultImage from "../assets/images/duck_result.png";
import CarbsIcon from "../assets/icons/Carbs.png";
import ProteinIcon from "../assets/icons/Protein.png";
import FatIcon from "../assets/icons/Fat.png";

function ResultNutrientCard({ icon, label, value }) {
  return (
    <div className="w-[68px]">
      <div className="h-[68px] rounded-[9px] bg-[#f8f8f8] flex items-center justify-center">
        <img
          src={icon}
          alt={label}
          className="max-w-[46px] max-h-[46px] object-contain"
        />
      </div>

      <p
        className="mt-[8px] font-light text-[#272932] tracking-[-0.02em]"
        style={{
          fontSize: "11px",
          lineHeight: "1",
        }}
      >
        {label}
      </p>

      <p
        className="mt-[6px] font-light text-[#6f7075] tracking-[-0.02em]"
        style={{
          fontSize: "10px",
          lineHeight: "1",
        }}
      >
        {value}gr
      </p>
    </div>
  );
}

export default function SignupResultPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const nutrition = location.state?.nutrition ?? {
    carbs: 280,
    protein: 75,
    fat: 80,
  };

  return (
    <MobileLayout>
      <header className="absolute left-0 right-0 top-[96px] flex flex-col items-center">
        <p className="text-[16px] leading-none font-normal text-[#272932] tracking-[-0.02em]">
          Check!
        </p>

        <KkirokLogo className="mt-[5px]" />
      </header>

      <main className="absolute left-0 right-0 top-[260px] flex flex-col items-center">
        <img
          src={DuckResultImage}
          alt="분석 결과를 알려주는 끼록 캐릭터"
          className="w-[230px] h-auto object-contain"
        />

        <p
          className="mt-[42px] font-light text-[#272932] tracking-[-0.02em]"
          style={{
            fontSize: "14px",
            lineHeight: "1",
          }}
        >
          맞춤 영양소 분석 결과가 나왔어요
        </p>

        <div className="mt-[28px] flex items-start justify-center gap-[18px]">
          <ResultNutrientCard
            icon={CarbsIcon}
            label="탄수화물"
            value={nutrition.carbs}
          />

          <ResultNutrientCard
            icon={ProteinIcon}
            label="단백질"
            value={nutrition.protein}
          />

          <ResultNutrientCard
            icon={FatIcon}
            label="지방"
            value={nutrition.fat}
          />
        </div>
      </main>

      <button
        type="button"
        onClick={() => navigate("/home")}
        className="absolute right-[28px] bottom-[46px] w-[58px] h-[58px] rounded-full flex items-center justify-center"
        style={{
          backgroundColor: "#272932",
          border: "2px solid #ffffff",
          boxShadow: "0 0 0 2px #272932",
          color: "#ffffff",
          fontSize: "30px",
          lineHeight: "1",
          fontWeight: 200,
        }}
      >
        ›
      </button>
    </MobileLayout>
  );
}