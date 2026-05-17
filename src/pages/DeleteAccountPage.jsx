import { useState } from "react";
import { useNavigate } from "react-router-dom";

import MobileLayout from "../components/layout/MobileLayout";
import BottomButton from "../components/common/BottomButton";
import KkirokCharacter from "../components/common/KkirokCharacter";
import BottomNav from "../components/layout/BottomNav";
import { clearAccessToken } from "../api/client";
import { deleteMe } from "../api/userApi";

export default function DeleteAccountPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;

    setError("");
    setIsDeleting(true);

    try {
      await deleteMe();
      clearAccessToken();
      navigate("/", { replace: true });
    } catch (deleteError) {
      setError(deleteError.message || "회원 탈퇴를 처리하지 못했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <MobileLayout>
      <main className="absolute left-0 right-0 top-[314px] flex flex-col items-center px-[58px] text-center">
        <KkirokCharacter
          variant="intro"
          alt="끼록 오리 캐릭터"
          className="w-[250px] h-auto object-contain"
        />

        <p className="mt-[30px] text-[18px] leading-[30px] font-light text-[#272932] tracking-[-0.03em]">
          탈퇴하시겠습니까?
          <br />
          모든 정보와 기록은 사라집니다.
        </p>

        {error && (
          <p className="mt-[18px] text-[12px] font-light text-[#ff5b5b]">
            {error}
          </p>
        )}
      </main>

      <BottomButton onClick={handleDelete} bottomClassName="bottom-[112px]">
        {isDeleting ? "탈퇴 중..." : "탈퇴하기"}
      </BottomButton>

      <BottomNav />
    </MobileLayout>
  );
}
