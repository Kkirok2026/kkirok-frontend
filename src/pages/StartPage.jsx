import { useNavigate } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import KkirokCharacter from "../components/common/KkirokCharacter";
import BottomButton from "../components/common/BottomButton";

export default function StartPage() {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      <main className="absolute left-0 right-0 top-[285px] flex flex-col items-center">
        <KkirokCharacter
          variant="intro"
          alt="끼록 오리 캐릭터"
          className="w-[250px] h-auto object-contain"
        />

        <p className="mt-[29px] text-[18px] leading-[26px] font-light text-[#272932] tracking-[-0.03em]">
          당신의 끼니를 기록하세요
        </p>
      </main>

      <BottomButton onClick={() => navigate("/login")}>
        시작하기
      </BottomButton>
    </MobileLayout>
  );
}